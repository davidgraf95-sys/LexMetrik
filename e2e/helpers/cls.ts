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
//
// WACHSER-DIAGNOSE (19.7.2026, A9-Forensik `fix/e2e-ci-haertung`): Die Shift-
// `sources` nennen nur die OPFER (verschobene Elemente), nie den WACHSER — das
// Element OBERHALB, dessen Höhe deterministisch einwächst und alles darunter
// verschiebt. Auf dem 2-vCPU-Runner zeigt A9 auf /gesetze/bund/OR pixel-gleich
// über 3 Läufe einen +30-px-Sprung (Grid 312,644→312,674; Ingress-Zeilen +30),
// dessen Wachser oberhalb y≈461 sitzt (App-Shell/Inhalts-Kopf, ErlassLeserKopf
// mit Titel/Meta-Zeile, Such-Bar, Ingress-Kopf). Lokal (macOS, schnelle CPU)
// tritt exakt DIESE Signatur nicht auf — nur eine spiegelbildliche, kleinere
// Font-Swap-Reflow-Variante (h1-Titel bricht 1↔2 Zeilen je nach Fallback-Metrik).
// Darum trägt dieser Helfer eine ZWEITE Instrumentierung: ein rAF-Höhen-Sampler
// über die «Über-dem-Grid»-Kette schreibt bei JEDEM Shift die Kind-Höhen (+y,
// fonts.status) mit; die expect-Meldung listet für die Top-Shifts, welche
// Über-Grid-Höhe sich zum Shift-Zeitpunkt verändert hat (= der Wachser mit
// Rect). Der nächste CI-Lauf liefert den Wachser damit datenscharf, ohne
// spekulativen Fix. Reine Diagnose (kein Assertion-/Mess-Effekt, §6.3).
import type { Page } from '@playwright/test'

// Installiert den Beobachter im Seitenkontext. `buffered` bleibt dem Aufrufer
// überlassen, damit das Mess-Fenster byte-gleich zur bisherigen Inline-Messung
// der jeweiligen Spec bleibt (a33/norm-sprung nutzen `buffered: true`).
export async function clsBeobachtenInstallieren(page: Page, buffered: boolean): Promise<void> {
  await page.evaluate((buffered) => {
    // Snapshot der «Über-dem-Grid»-Kette: Höhe (h) + y je Kandidat-Wachser.
    interface Oben { [name: string]: { h: number; y: number } }
    interface Q { el: string; von: string; nach: string }
    interface S { wert: number; tMs: number; quellen: Q[]; oben: Oben; obenDelta: string }
    const w = window as unknown as {
      __cls: number
      __clsQuellen: S[]
      __clsInstallMs: number
      __clsObenRing?: Oben[]
      __clsSamplerLaeuft?: boolean
    }
    w.__cls = 0
    w.__clsQuellen = []
    w.__clsInstallMs = Math.round(performance.now())
    // Ring der letzten Über-Grid-Snapshots (rAF-gesampelt). Der Shift-Callback
    // vergleicht den JETZT-Stand gegen einen Stand aus dem Ring VOR dem Wachsen —
    // ein Ein-Frame-Vergleich verpasst den Sprung (der Sampler hat den neuen Stand
    // bis dahin schon übernommen). Wurde der Sampler bereits VORAB (vor `goto`, per
    // `clsHoehenSamplerVorabInstallieren`) gestartet, trägt der Ring schon die
    // Lade-Historie — dann NICHT zurücksetzen und keinen zweiten Sampler starten
    // (sonst verlöre der Über-Grid-Delta die Vorgeschichte des ~2.7-s-Lade-Shifts).
    if (!w.__clsObenRing) w.__clsObenRing = []

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

    // ── Über-dem-Grid-Höhen-Sampler (Wachser-Diagnose) ────────────────────────
    // Misst die Höhe (+y) der DOM-Kette OBERHALB des 2-Spalten-Lese-Grids. Der
    // Wachser ist das Kind, dessen Höhe zum Shift-Zeitpunkt springt. Robust gegen
    // fehlende Knoten (früh im Lade-Pfad) und den Inhalts-Kopf-Grid (grid-cols-
    // [1fr_auto_1fr]) — es zählt allein das Lese-Grid (className enthält «16rem»).
    const hy = (el: Element | null): { h: number; y: number } => {
      if (!el) return { h: -1, y: -1 }
      const r = el.getBoundingClientRect()
      return { h: Math.round(r.height), y: Math.round(r.y) }
    }
    const leseGrid = (): Element | null => {
      const grids = document.querySelectorAll('div[class*="grid-cols-"]')
      for (const g of Array.from(grids)) if (/16rem/.test((g as HTMLElement).className)) return g
      return null
    }
    const obenSnapshot = (): Oben => {
      const h1 = document.querySelector('h1')
      const header = (h1 && h1.closest('header')) || document.querySelector('header')
      const ing = document.querySelector('section[aria-label="Ingress"]')
      return {
        topbar: hy(document.querySelector('header.sticky, [data-topbar]')),
        inhaltsKopf: hy(document.querySelector('.sticky.top-16')),
        header: hy(header),
        overline: hy(header ? header.querySelector('.lc-overline') : null),
        h1: hy(h1),
        meta: hy(header ? header.querySelector('div.flex.flex-wrap') : null),
        suchBar: hy(document.querySelector('[data-such-bar]')),
        ingress: hy(ing),
        ingDatum: hy(ing ? ing.querySelector('p.font-serif.text-body-s') : null),
        ingP: hy(ing ? ing.querySelector('p.font-serif.text-body-l') : null),
        grid: hy(leseGrid()),
      }
    }
    const RING_TIEFE = 30
    const sample = (): void => {
      const ring = w.__clsObenRing as Oben[]
      ring.push(obenSnapshot())
      if (ring.length > RING_TIEFE) ring.shift()
      requestAnimationFrame(sample)
    }
    // Nur EINEN Sampler laufen lassen (der Vorab-Sampler kann schon aktiv sein).
    if (!w.__clsSamplerLaeuft) {
      w.__clsSamplerLaeuft = true
      requestAnimationFrame(sample)
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
        // Über-Grid-Snapshot zum Shift-Zeitpunkt + Delta gegen einen Stand VOR dem
        // Wachsen (ältester Ring-Eintrag): welches Über-Grid-Element ist HÖHER
        // geworden (= Wachser-Kandidat)? Ein-Frame-Vergleich verpasst den Sprung.
        const oben = obenSnapshot()
        const ring = w.__clsObenRing as Oben[]
        const vorher = ring.length ? ring[0] : null
        const deltas: string[] = []
        if (vorher) {
          for (const k of Object.keys(oben)) {
            if (k === 'grid') continue
            const dh = oben[k].h - (vorher[k]?.h ?? oben[k].h)
            if (Math.abs(dh) >= 4 && oben[k].h >= 0 && (vorher[k]?.h ?? -1) >= 0) {
              deltas.push(`${k} ${dh > 0 ? '+' : ''}${dh}px→${oben[k].h}`)
            }
          }
        }
        w.__clsQuellen.push({
          wert: e.value,
          tMs: Math.round(e.startTime),
          quellen,
          oben,
          obenDelta: deltas.length ? deltas.join(', ') : '(kein Über-Grid-Höhensprung ≥4px erfasst)',
        })
      }
    }).observe({ type: 'layout-shift', buffered })
  }, buffered)
}

// Startet NUR den Über-Grid-Höhen-Sampler (den Ring `w.__clsObenRing`) bereits am
// Dokument-Start — VOR `page.goto`, per addInitScript. Zweck: der problematische
// A9-Lade-Shift (~2.7 s auf dem 2-vCPU-Runner) wird vom `buffered`-Observer erst
// NACH seinem Install nachgezogen; ohne Vorgeschichte im Ring könnte der Shift-
// Callback den Wachser für diesen Lade-Shift nicht benennen. Läuft der Sampler
// schon ab Navigation, trägt der Ring die Höhen VOR dem Einwachsen → der Delta
// nennt den Wachser auch für den Lade-Shift. `clsBeobachtenInstallieren` erkennt
// den laufenden Sampler (`__clsSamplerLaeuft`) und startet keinen zweiten. Reine
// Diagnose, kein Mess-/Assertion-Effekt (§6.3). Aufruf im A9-Test VOR dem `goto`.
export async function clsHoehenSamplerVorabInstallieren(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface Oben { [name: string]: { h: number; y: number } }
    const w = window as unknown as { __clsObenRing?: Oben[]; __clsSamplerLaeuft?: boolean }
    if (w.__clsSamplerLaeuft) return
    w.__clsObenRing = w.__clsObenRing ?? []
    w.__clsSamplerLaeuft = true
    const hy = (el: Element | null): { h: number; y: number } => {
      if (!el) return { h: -1, y: -1 }
      const r = el.getBoundingClientRect()
      return { h: Math.round(r.height), y: Math.round(r.y) }
    }
    const leseGrid = (): Element | null => {
      const grids = document.querySelectorAll('div[class*="grid-cols-"]')
      for (const g of Array.from(grids)) if (/16rem/.test((g as HTMLElement).className)) return g
      return null
    }
    const obenSnapshot = (): Oben => {
      const h1 = document.querySelector('h1')
      const header = (h1 && h1.closest('header')) || document.querySelector('header')
      const ing = document.querySelector('section[aria-label="Ingress"]')
      return {
        topbar: hy(document.querySelector('header.sticky, [data-topbar]')),
        inhaltsKopf: hy(document.querySelector('.sticky.top-16')),
        header: hy(header),
        overline: hy(header ? header.querySelector('.lc-overline') : null),
        h1: hy(h1),
        meta: hy(header ? header.querySelector('div.flex.flex-wrap') : null),
        suchBar: hy(document.querySelector('[data-such-bar]')),
        ingress: hy(ing),
        ingDatum: hy(ing ? ing.querySelector('p.font-serif.text-body-s') : null),
        ingP: hy(ing ? ing.querySelector('p.font-serif.text-body-l') : null),
        grid: hy(leseGrid()),
      }
    }
    const RING_TIEFE = 30
    const sample = (): void => {
      const ring = w.__clsObenRing as Oben[]
      ring.push(obenSnapshot())
      if (ring.length > RING_TIEFE) ring.shift()
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
}

// Liest CLS-Summe + einen kompakten, nach Shift-Beitrag sortierten Bericht der
// Top-Quellen (Top 5 Shifts, je bis 3 Quellen). Der `Beobachter@Xms`-Marker
// erlaubt es, Lade-Shifts (tMs < X, via `buffered` nachgezogen) von den durch
// die gemessene Interaktion ausgelösten Shifts (tMs > X) zu unterscheiden.
// Zusätzlich (Wachser-Diagnose 19.7.): je Top-Shift der Über-Grid-Höhen-Delta
// (welches Element OBERHALB des Grids wuchs) + der kompakte Über-Grid-Snapshot
// (Höhe/y je Kandidat) — so nennt der rote CI-Lauf den Wachser direkt.
export async function clsAuslesen(page: Page): Promise<{ cls: number; bericht: string }> {
  return page.evaluate(() => {
    interface Oben { [name: string]: { h: number; y: number } }
    interface Q { el: string; von: string; nach: string }
    interface S { wert: number; tMs: number; quellen: Q[]; oben: Oben; obenDelta: string }
    const w = window as unknown as {
      __cls?: number
      __clsQuellen?: S[]
      __clsInstallMs?: number
    }
    const cls = w.__cls ?? 0
    const shifts = (w.__clsQuellen ?? []).slice().sort((a, b) => b.wert - a.wert).slice(0, 5)
    if (shifts.length === 0) return { cls, bericht: '(keine Shift-Quellen erfasst)' }
    const install = w.__clsInstallMs ?? 0
    const obenKompakt = (o: Oben): string =>
      Object.entries(o)
        .filter(([, v]) => v.h >= 0)
        .map(([k, v]) => `${k}=${v.h}/${v.y}`)
        .join(' ')
    const zeilen = shifts.map((s) => {
      const els = s.quellen.length
        ? s.quellen.map((q) => `${q.el} ${q.von}→${q.nach}`).join('; ')
        : '(ohne Quelle)'
      // Wachser-Zeile: Über-Grid-Höhensprung zuerst (das ist die eigentliche
      // Ursache), dann der volle Über-Grid-Snapshot (h/y) zur Nachkontrolle.
      return `Δ${s.wert.toFixed(4)} @${s.tMs}ms [${els}] ⇑Wachser: ${s.obenDelta} ⟨${obenKompakt(s.oben)}⟩`
    })
    return { cls, bericht: `Beobachter@${install}ms · Top-Quellen: ${zeilen.join(' || ')}` }
  })
}
