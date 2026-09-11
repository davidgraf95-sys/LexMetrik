// ─── Trefferflächen-Token (DESIGN-REGLEMENT F9, W2·10-UI-NAV-R4 / R6) ───────
//
// E1 macht aus der Reglement-Zeile eine Schranke: die Mindest-Hitbox lebt als
// EIN Token `--tap-ziel` in `src/index.css` und wird von den Komponenten-
// Klassen als `var(--tap-ziel)` gegriffen — nie als rohe Zahl (D2 «keine
// Magic-Numbers», §5 «eine Quelle»).
//
// Der Wert selbst ist normativ, nicht gestalterisch: WCAG 2.2, Erfolgs-
// kriterium 2.5.8 «Target Size (Minimum)», Konformitätsstufe AA
// (https://www.w3.org/TR/WCAG22/#target-size-minimum, W3C Recommendation
// vom 5.10.2023) verlangt 24 × 24 CSS-px. Der Test lässt darum GRÖSSER zu
// (Verschärfung ist erlaubt), KLEINER nie.
//
// Abgrenzung: `height:` bleibt ungeprüft — 44 px in `.lc-btn` und 36 px in
// `.lc-btn-sm`/`.lc-input-sm` sind die ANATOMIE des Knopfes (feste Höhe einer
// Grössenvariante), nicht eine Untergrenze. Geprüft wird genau das, was die
// Regel meint: `min-height`/`min-width`.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const CSS = readFileSync('src/index.css', 'utf8')

// WCAG 2.2 SC 2.5.8 (AA) — die Untergrenze, die der Token nie unterschreiten darf.
const WCAG_2_5_8_MIN_PX = 24

/** Rohe min-*-ZAHLEN aus DEKLARATIONEN (F9/D2, B3 Bug-Check #428) — nicht aus
 *  einer @media-/@container-BEDINGUNG. Kommentare vorher entfernen: sie
 *  zitieren die Zahl 24 legitim als Beleg (§7) — verboten ist die Zahl in der
 *  Deklaration, nicht im Kommentar.
 *
 *  Die negative Lookahead `(?!\s*\))` ist die Abgrenzung (Nachtrag PR #796,
 *  Umweg `max-width: 47.99rem` in src/index.css): eine @media-/@container-
 *  BEDINGUNG schliesst direkt nach der Einheit mit `)` — `(min-width: 48rem)`
 *  — eine DEKLARATION nie (sie endet mit `;`, `}` oder weiterem Wert). Nur der
 *  erste Fall wird ausgenommen. */
function rohesMinMass(css: string): string[] {
  const ohneKommentare = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return [
    ...ohneKommentare.matchAll(
      /min-(?:height|width|block-size|inline-size)\s*:\s*([0-9.]+)(px|rem|em)(?!\s*\))/g,
    ),
  ].map((t) => `min-…: ${t[1]}${t[2]}`)
}

describe('DESIGN-REGLEMENT F9 — Trefferflächen-Token', () => {
  it('definiert --tap-ziel genau einmal in :root', () => {
    const treffer = [...CSS.matchAll(/^\s*--tap-ziel\s*:/gm)]
    expect(treffer.length, '--tap-ziel darf nur EINE Definition haben (§5)').toBe(1)
  })

  it('hält den WCAG-2.5.8-Wert (≥ 24 px) ein', () => {
    const m = CSS.match(/--tap-ziel\s*:\s*([0-9.]+)px/)
    expect(m, '--tap-ziel muss ein px-Wert sein (Hitboxen werden in CSS-px gemessen)').not.toBeNull()
    const px = Number(m![1])
    expect(px, `WCAG 2.2 SC 2.5.8 verlangt ≥ ${WCAG_2_5_8_MIN_PX} CSS-px`).toBeGreaterThanOrEqual(WCAG_2_5_8_MIN_PX)
  })

  it('lässt keine rohe min-height/min-width-Zahl in den Komponenten-Klassen zu', () => {
    expect(
      rohesMinMass(CSS),
      'Trefferflächen kommen aus var(--tap-ziel), nicht aus einer Zahl (F9/D2)',
    ).toEqual([])
  })

  it('unterscheidet Element-Deklaration und @media-/@container-BEDINGUNG (Wächter-Fixture, F9-Nachtrag PR #796)', () => {
    // Fixture, kein Produktverhalten (§6.3): zeigt, dass der Wächter eine rohe
    // Element-min-width weiterhin fängt, eine @media-/@container-Bedingung
    // `(min-width: …)` aber nicht mehr fälschlich als Deklaration liest — der
    // Umweg auf `max-width: 47.99rem` in src/index.css war nur nötig, weil das
    // alte Muster diese Bedingung mitgetroffen hat.
    const elementDeklaration = '.tap-el { min-width: 44px; }'
    expect(
      rohesMinMass(elementDeklaration),
      'eine rohe Element-min-width muss weiterhin auffallen',
    ).toEqual(['min-…: 44px'])

    const mediaBedingung = '@media (min-width: 48rem) { .tap-el { display: grid; } }'
    expect(
      rohesMinMass(mediaBedingung),
      'eine @media-Bedingung ist keine Deklaration und darf nicht auffallen',
    ).toEqual([])

    const containerBedingung = '@container (min-width: 20rem) { .tap-el { display: grid; } }'
    expect(
      rohesMinMass(containerBedingung),
      'eine @container-Bedingung ist keine Deklaration und darf nicht auffallen',
    ).toEqual([])
  })

  it('wird von den W2·10-Flächen (Kopf-Chips, Leser-Werkzeugleiste) tatsächlich gegriffen', () => {
    // Die Regel ist nur so viel wert wie ihre Anwendung: beide Klassen, die die
    // W2·10-Bedienflächen tragen, müssen den Token führen.
    const chip = CSS.match(/\.lc-chip\s*\{[\s\S]*?\}/)?.[0] ?? ''
    const griff = CSS.match(/\.lc-leiste-griff\s*\{[\s\S]*?\}/)?.[0] ?? ''
    expect(chip, '.lc-chip (Kopf-Metazeilen/Facetten) greift --tap-ziel').toContain('var(--tap-ziel)')
    expect(griff, '.lc-leiste-griff (Leser-Werkzeugleiste) greift --tap-ziel').toContain('var(--tap-ziel)')
  })
})
