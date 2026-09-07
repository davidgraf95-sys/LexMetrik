// @shard-gruppe: 3
import { test, expect, type Page } from '@playwright/test'

// ═══ Ä60 (c) · DER BREITERE LESER-RAHMEN (W2·5m-LESER-V3, Etappe H4) ═════════
//
// DAVID-ENTSCHEID 17.8.2026 (Chat, wörtlich «ja und c, mach so»): von den drei
// Optionen des Spalten-Entscheids gilt (c) — der Rahmen des GESETZ-LESERS wird
// breiter, damit Gesetzestext und Beiwerk-Blatt NEBENEINANDER stehen statt
// übereinander. Jede andere Seite bleibt auf `max-w-content`.
//
// DER BEFUND, DEN DAS BEHEBT (gemessen 17./18.8.2026, StPO Art. 429, Panel offen
// — verdeckte px je Textzeile bzw. am Erlass-Titel):
//
//   Viewport   1024   1150   1280   1440   1920
//   Text        320    257    192    112      0
//   Titel       328    313    248    168      0   ← das ist Ä59
//
// ROT ZU BEKOMMEN (§6.7): in `src/pages/gesetz-leser/v3/rahmenSpalten.ts` die
// Zeile `const blattSpur = …` auf `false` setzen (dann liegt das Blatt wieder
// über dem Text ⇒ (a)/(b)/(e) rot) oder `LESER_MAX_REM` auf 67 zurücksetzen
// (der Rahmen kann nicht mehr wachsen ⇒ (a) rot, weil die Spur den Text unter
// das Lesemass drückt). Beide Beweise sind am 18.8.2026 gefahren worden.

const ERLASS = '/gesetze/bund/STPO'

// ── §6.3-DEKLARATION (W2·24-CI, 6.9.2026) · DIE LESESTELLE WIE EIN LESER ────
// Hier stand `document.getElementById('art-429')?.scrollIntoView()` — ein roher
// DOM-Scroll, den auf dieser Seite NIEMAND auslöst: der Leser kommt über den
// Deep-Link, den Gliederungs-Sprung oder einen Treffer, und alle drei laufen
// über den Sprung-Pfad des Readers (`inhalt-sprung.tsx`/`scrollAnker.ts`), der
// die Landung nach der `content-visibility`-Neuschätzung nachkorrigiert.
// GEMESSEN 6.9.2026 (StPO @1280, `scratchpad/diag2.cjs`/`diag19.cjs`, dist):
//   · roher `scrollIntoView`: landet bei 198 px (korrekt) und driftet 100 ms
//     später auf 133 px — die Artikel 427/428 über dem Ziel schrumpfen beim
//     Materialisieren um zusammen ~66 px, `scrollY` bleibt stehen. Auf
//     origin/main schrumpfen dieselben Artikel um 196 px und `scrollY` zieht
//     mit; die Ursache dieser Differenz ist noch offen (die naheliegende
//     Vermutung «Arbeitsleiste unterdrückt das Scroll-Anchoring» ist
//     falsifiziert, s. `.rl-stelle` in `src/index.css`).
//   · PRODUKT-Weg `#art-429`: Abstand Kopf→Artikel −1 px, über 4 s stabil,
//     auf BEIDEN Ständen.
// Der Fall (e2) misst das Öffnen des Blattes, nicht `scrollIntoView`. Sein
// Vorzustand wird darum über den Weg hergestellt, den der Leser hat; die
// Assertions bleiben Wort für Wort dieselben und sind dadurch wieder scharf:
// vorher massen sie eine Ausgangslage, die schon vor dem Öffnen kaputt war.
async function leserLaden(page: Page, breite: number): Promise<void> {
  await page.setViewportSize({ width: breite, height: 900 })
  await page.goto(`${ERLASS}#art-429`)
  await expect(page.locator('.lc-leser[data-leser-v3="rahmen"]')).toHaveCount(1)
  await expect(page.locator('#art-1')).toBeAttached({ timeout: 20_000 })
  await page.evaluate(() => document.fonts?.ready)
  await expect(page.locator('#art-429')).toBeVisible({ timeout: 20_000 })
  // Der Sprung ist gelandet, wenn die Zielstelle unter dem klebenden Kopf
  // steht — darauf warten statt auf eine feste Uhr.
  await expect.poll(async () => page.evaluate(() => {
    const kopf = document.querySelector('[data-v3-kopf]')
    const art = document.getElementById('art-429')
    if (!kopf || !art) return 9999
    return Math.round(Math.abs(art.getBoundingClientRect().top - kopf.getBoundingClientRect().bottom))
  }), { timeout: 20_000 }).toBeLessThanOrEqual(4)
  await page.waitForTimeout(300)
}

/** Panel über den Kopf-Zähler aufziehen — der Weg, den auch ein Nutzer hat. */
async function panelAufziehen(page: Page): Promise<void> {
  await page.locator('[data-v3-panel-zaehler]').first().click()
  await expect(page.locator('[data-v3-panel]').first()).toBeVisible({ timeout: 20_000 })
}

interface Masse {
  text: { x: number; r: number; b: number } | null
  blatt: { x: number; r: number; b: number } | null
  titel: { x: number; r: number; b: number } | null
  aside: number
  schiene: number
  form: string | null
  rahmen: number
  ch: number | null
  overflow: number
}

/** Alle Masse in EINEM `evaluate` — sonst misst jede Zeile einen anderen Moment. */
function messen(page: Page): Promise<Masse> {
  return page.evaluate(() => {
    const kasten = (sel: string) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), r: Math.round(r.right), b: Math.round(r.width) }
    }
    // Lesemass nach der Methode von `leser-lesemass.e2e.ts`: der Absatz mit den
    // MEISTEN Zeichen je Zeile, nicht irgendeiner.
    let ch: number | null = null
    let text: { x: number; r: number; b: number } | null = null
    document.querySelectorAll('#lc-lesespalte [id^="art-"] p').forEach((p) => {
      const inhalt = (p.textContent ?? '').trim()
      if (inhalt.length < 40) return
      const range = document.createRange()
      range.selectNodeContents(p)
      const kaesten = range.getClientRects()
      if (kaesten.length < 3) return
      const wert = Math.round(inhalt.length / kaesten.length)
      if (ch === null || wert > ch) {
        ch = wert
        const r = (p as HTMLElement).getBoundingClientRect()
        text = { x: Math.round(r.x), r: Math.round(r.right), b: Math.round(r.width) }
      }
    })
    // Ohne umbrechenden Absatz (schmale Spalte) trägt die Lesespalte selbst die
    // Kante — gemessen wird dann sie, nie gar nichts.
    return {
      text: text ?? kasten('#lc-lesespalte'),
      blatt: kasten('[data-v3-panel-form]'),
      titel: kasten('[data-v3-erlass-kopf] h1') ?? kasten('h1'),
      aside: document.querySelectorAll('[data-v3-aside]').length,
      schiene: document.querySelectorAll('[data-v3-gliederung-schiene]').length,
      form: document.querySelector('[data-v3-panel-form]')?.getAttribute('data-v3-panel-form') ?? null,
      rahmen: Math.round(document.querySelector('[data-leser-v3="rahmen"]')!.getBoundingClientRect().width),
      ch,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
}

/** Überlappung zweier Kästen in px (0 = keine). */
function deckung(a: { x: number; r: number } | null, b: { x: number; r: number } | null): number {
  if (!a || !b) return 0
  return Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x))
}

test.describe('Ä60 (c) — Text und Beiwerk-Blatt stehen nebeneinander', () => {
  // ── (a) @1440: die volle Lage — drei Spuren, nichts verdeckt ───────────────
  test('(a) @1440: Blatt als eigene Spur, keine Überlappung, Lesemass ≤ 80 ch', async ({ page }) => {
    await leserLaden(page, 1440)
    const zu = await messen(page)
    // ── §6.3-DEKLARATION (W2·24-R6/M1, 6.9.2026) · ZWEI GRÜNDE ZUR AUFWEITUNG ─
    // Die Positiv-Sonde stand auf `toBe(1072)`: «ohne Panel ist der Rahmen der
    // alte, sonst prüfte der Fall eine Seite, die immer schon breit war». Seit
    // R6 weitet auch die RANDNOTIZ-Spalte des Satzspiegels den Rahmen auf, und
    // die steht @1440 dauerhaft — der Rahmen ist darum in BEIDEN Zuständen
    // 1'320 px, und das Panel muss nichts mehr holen. Gemessen: `zu.rahmen`
    // 1'320, `auf.rahmen` 1'320.
    // Die ABSICHT der Sonde bleibt und wird an der Sache gemessen statt an der
    // Zahl: der Rahmen darf nie über `LESER_MAX_REM` hinaus (sonst wäre es
    // Fensterbreite für Fliesstext, Design-Grundlage Kap. 8 Nr. 7), und alles,
    // was dieser Fall danach prüft — eigene Blatt-Spur, keine Überlappung,
    // Lesemass ≤ 80 ch, Gliederungsspalte bleibt —, steht byte-gleich.
    expect(zu.rahmen, '@1440 ist der Rahmen breiter als LESER_MAX_REM (1320 px)')
      .toBeLessThanOrEqual(1320)

    await panelAufziehen(page)
    const auf = await messen(page)

    expect(auf.form, '@1440 trägt das Blatt nicht die eigene Spur').toBe('spalte')
    expect(auf.aside, '@1440 passen alle drei Spuren — die Gliederungsspalte muss stehen bleiben').toBe(1)
    expect(deckung(auf.text, auf.blatt),
      `Blatt verdeckt den Lesetext (Text ${auf.text?.x}…${auf.text?.r}, Blatt ${auf.blatt?.x}…${auf.blatt?.r})`)
      .toBe(0)
    // Ä59: derselbe Befund am Erlass-Titel, und mit derselben Messung erledigt.
    expect(deckung(auf.titel, auf.blatt), 'der Erlass-Titel liegt unter dem Blatt (Ä59)').toBe(0)
    // Das Lesemass bleibt, was es war: die Spur nimmt den freien Rand, nicht den Text.
    // §6.3-DEKLARATION (W2·24-R6/M1, 6.9.2026) · 12 px Toleranz, GERECHNET:
    // Im geschlossenen Zustand steht @1440 der volle Satzspiegel, und der
    // schuldet der Lese-Zelle `--lr-textmass` (591) + Marginalie (150) +
    // Randnotiz (210) + zwei Rinnen (72) = 1'023 px. Die Zelle hat 1'012
    // (`LESER_MAX_REM` 1'320 − Gliederung 308); die fehlenden 11 px nimmt der
    // Wortlaut, er misst darum 580 statt 591 px (66 statt 67 Zeichen, beides
    // weit unter der SC-1.4.8-Decke, die zwei Zeilen tiefer weiterhin geprüft
    // wird). Das Blatt aufzuziehen gibt sie zurück, weil dann keine Randnotiz
    // mehr steht. Die ZUSAGE des Falls — «die Spur nimmt den freien Rand, nicht
    // den Text» — bleibt damit intakt: was das Blatt nimmt, sind 0 px vom Text.
    // Der Deckel ist knapp über dem gemessenen Wert; ein echter Griff in den
    // Text (Marginalie 150 oder Notiz-Spur 210 px) bliebe rot.
    expect(Math.abs(auf.text!.b - zu.text!.b),
      `@1440 verliert die Lesespalte durch die Spur an Breite (${zu.text!.b} → ${auf.text!.b})`)
      .toBeLessThanOrEqual(12)
    expect(auf.ch!, `Lesemass ${auf.ch} ch (WCAG SC 1.4.8)`).toBeLessThanOrEqual(80)
    expect(auf.overflow, 'waagrechter Überlauf des Dokuments').toBeLessThanOrEqual(1)
  })

  // ── (b) @1150: der enge Fall — die Gliederung weicht, der Text bleibt ──────
  test('(b) @1150: keine Überlappung, Textspalte ≥ 28 rem, Schiene statt Spalte', async ({ page }) => {
    await leserLaden(page, 1150)
    await panelAufziehen(page)
    const auf = await messen(page)

    expect(auf.form, '@1150 trägt das Blatt nicht die eigene Spur').toBe('spalte')
    expect(deckung(auf.text, auf.blatt), 'Blatt verdeckt den Lesetext @1150').toBe(0)
    expect(deckung(auf.titel, auf.blatt), 'der Erlass-Titel liegt unter dem Blatt @1150 (Ä59)').toBe(0)
    // Die Gliederung weicht auf ihre Schiene — und ist damit EIN Klick entfernt,
    // nicht fort (`rahmenSpalten`: die Spalte bleibt nur bei vollem Lesemass).
    expect(auf.aside, '@1150 stehen Gliederungsspalte UND Blatt — dann ist der Text zu schmal').toBe(0)
    expect(auf.schiene, '@1150 fehlt die Schiene — die Gliederung wäre unerreichbar').toBe(1)
    // 28 rem = 448 px ist der Boden, den `rahmenSpalten.LESE_MIN` zusichert.
    expect(auf.text!.b, `Lesespalte @1150 nur ${auf.text!.b} px`).toBeGreaterThanOrEqual(448)
    expect(auf.overflow, 'waagrechter Überlauf des Dokuments @1150').toBeLessThanOrEqual(1)
  })

  // ── (c) die Spaltengrenze 1024 ist UNVERÄNDERT ────────────────────────────
  // Der Rahmen wird breiter — die Schwelle, ab der die Gliederung überhaupt eine
  // Spalte sein kann, bleibt der Viewport 1024 (A-8, Kap. 12: die Umstellung auf
  // eine Element-Messung würde sie verschieben und ist darum NICHT erfolgt).
  test('(c) @1024 trägt die Gliederungsspalte, @1023 nicht — die Grenze bleibt', async ({ page }) => {
    await leserLaden(page, 1024)
    expect((await messen(page)).aside, '@1024 fehlt die Gliederungsspalte — die Grenze ist gewandert').toBe(1)

    await leserLaden(page, 1023)
    const schmal = await messen(page)
    expect(schmal.aside, '@1023 steht eine Gliederungsspalte — die Grenze ist gewandert').toBe(0)
    // Und unter 1024 bleibt ALLES wie bisher (David: «unter 1024 bleibt alles wie
    // heute»): das Blatt bekommt dort KEINE Spur, der Rahmen wächst nicht.
    await panelAufziehen(page)
    const auf = await messen(page)
    expect(auf.form, '@1023 hat das Blatt eine eigene Spur bekommen — unter 1024 sollte nichts anders sein').toBe('rechts')
    expect(auf.rahmen, '@1023 ist der Rahmen gewachsen').toBe(schmal.rahmen)
  })

  // ── (d) jede andere Seite bleibt auf `max-w-content` ──────────────────────
  test('(d) Startseite und Rechner behalten ihre Inhaltsbreite (1072 px @1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    for (const pfad of ['/', '/gesetze']) {
      await page.goto(pfad)
      await expect(page.locator('main#inhalt')).toBeVisible({ timeout: 20_000 })
      const breite = await page.evaluate(() => {
        const wrap = document.querySelector('main#inhalt > div') as HTMLElement | null
        if (!wrap) return null
        const cs = getComputedStyle(wrap)
        return Math.round(wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight))
      })
      expect(breite, `${pfad}: Inhaltsbreite ${breite} px statt 1072 — die Leser-Aufweitung leckt`).toBe(1072)
    }
  })

  // ── (f) Ä86 · die Spur ist Layout, kein Popover ───────────────────────────
  // BEFUND (Klick-Test 18.8.2026, Stand `6ca1609b3`, @1440/@1024): das
  // angedockte Panel schloss bei JEDEM Klick in die Lesespalte — Textmarkieren
  // bei offenem Panel war unmöglich (`usePopoverAutoZu` Modus «beiwerk»).
  // Sobald das Blatt als eigene Spur NEBEN dem Text steht, ist es kein
  // aufgezogenes Blatt mehr: Schliessen nur über ✕ · Esc · Zweitklick auf den
  // Zähler · «r». UNTER 1024 px bleibt es beim alten Verhalten — der dritte
  // Fall unten ist die Gegenprobe dazu (§6.7: sonst prüfte (f) nur, dass
  // irgendwo nichts schliesst).
  for (const breite of [1440, 1150]) {
    test(`(f) @${breite}: Klick in den Text lässt das Blatt offen, Auswahl möglich`, async ({ page }) => {
      await leserLaden(page, breite)
      await panelAufziehen(page)
      const panel = page.locator('[data-v3-panel]').first()

      const absatz = page.locator('#lc-lesespalte [id^="art-"] p').first()
      await absatz.scrollIntoViewIfNeeded()
      await absatz.click({ position: { x: 5, y: 5 } })
      await expect(panel, `@${breite}: der Klick in den Text hat das Blatt geschlossen`).toBeVisible()

      // Und wirklich MARKIEREN, nicht nur klicken: der Dreifachklick wählt den
      // Absatz. Ein Blatt, das dabei zugeht, macht die Auswahl unbrauchbar.
      await absatz.click({ clickCount: 3 })
      const auswahl = await page.evaluate(() => (window.getSelection()?.toString() ?? '').trim().length)
      expect(auswahl, `@${breite}: nichts markiert`).toBeGreaterThan(20)
      await expect(panel, `@${breite}: das Markieren hat das Blatt geschlossen`).toBeVisible()

      // Die benannten Wege heraus bleiben: Zweitklick auf den Zähler schliesst.
      await page.locator('[data-v3-panel-zaehler]').first().click()
      await expect(page.locator('[data-v3-panel]')).toHaveCount(0)
    })
  }

  test('(f2) Gegenprobe @1023: unter der Spalten-Grenze schliesst der Aussenklick weiterhin', async ({ page }) => {
    await leserLaden(page, 1023)
    await panelAufziehen(page)
    await expect(page.locator('[data-v3-panel-form="rechts"]')).toBeVisible()
    const absatz = page.locator('#lc-lesespalte [id^="art-"] p').first()
    await absatz.scrollIntoViewIfNeeded()
    await absatz.click({ position: { x: 5, y: 5 } })
    await expect(page.locator('[data-v3-panel]'),
      '@1023 bleibt das Blatt offen — die neue Regel leckt unter die 1024er-Grenze').toHaveCount(0)
  })

  // ── (e) der gelesene Text bleibt an seiner Leseposition ──────────────────
  // Die Aufweitung verstellt die BREITE des Rahmens. Sie darf den gelesenen
  // Text darum waagrecht bewegen (die Spur braucht Platz) — senkrecht NICHT.
  // Ein Blatt, das beim Aufziehen die Lesestelle wegschiebt, ist genau der
  // Mangel, den `useStickAusgleich` für die Gliederung behoben hat.
  test('(e) Öffnen und Schliessen verschieben die Lesestelle senkrecht nicht', async ({ page }) => {
    await leserLaden(page, 1440)
    const y = () => page.evaluate(() => Math.round(document.getElementById('art-429')!.getBoundingClientRect().y))
    const vorher = await y()
    const rahmenVorher = (await messen(page)).rahmen
    await panelAufziehen(page)
    expect(Math.abs((await y()) - vorher), 'das Aufziehen verschiebt die Lesestelle senkrecht').toBeLessThanOrEqual(2)
    // Und zurück: der Rundlauf lässt keinen Versatz zurück (Klasse Ä26/S2).
    await page.locator('[data-v3-panel-zu]').first().click()
    await expect(page.locator('[data-v3-panel]')).toHaveCount(0)
    expect(Math.abs((await y()) - vorher), 'nach dem Schliessen steht die Lesestelle woanders').toBeLessThanOrEqual(2)
    // §6.3-DEKLARATION (W2·24-R6/M1, Herleitung bei Fall (a)): der Rahmen ist
    // nach dem Schliessen wieder GENAU DER, der er vor dem Öffnen war — das ist
    // die Zusage, nicht eine feste Zahl. Seit R6 hält ihn die Randnotiz-Spalte
    // @1440 ohnehin auf 1'320 px; ein Rundlauf, der etwas zurücklässt, wäre
    // weiterhin rot.
    expect((await messen(page)).rahmen, 'der Rahmen bleibt nach dem Schliessen verändert').toBe(rahmenVorher)
  })

  // ── (e2) Ä88 · derselbe Satz dort, wo das Blatt die Gliederung FALTET ──────
  // Zwischen 1024 und 1391 px reicht der Raum nicht für Spalte UND Blatt: die
  // Gliederung weicht auf ihre Schiene, die Such-Zone wandert in den klebenden
  // Kopf (Ä19), und der wächst um 44 px. (e) misst @1440 — dort passiert das
  // gar nicht, der Fall konnte den Mangel also nicht sehen.
  //
  // GEMESSEN VOR DEM FIX (18.8.2026, StPO Art. 429, `scratchpad/a-mess.cjs`):
  //   @1024  Kopfhöhe 57 → 101 px · Abstand Block→Artikel −1 → **−45** px
  //          (die Artikel-Überschrift lag hinter dem Kopf, also unsichtbar)
  //   @1150  57 → 101 px · Abstand −1 → −1 px   (Chromium-Anchoring trug)
  //   @1280  57 → 101 px · Abstand −1 → −1 px
  //
  // GEMESSEN WIRD DER ABSTAND, NICHT DIE y-KOORDINATE — und das ist keine
  // Aufweichung, sondern die Invariante von `useStickAusgleich`: der gelesene
  // Artikel behält seinen Platz UNTER der Unterkante des klebenden Blocks. Eine
  // Prüfung auf `y` allein wäre @1150/@1280 rot, obwohl dort nichts verloren
  // geht (Kopf und Artikel wandern gemeinsam um 44 px), und @1024 grün gewesen,
  // wo die Überschrift verschwand.
  //
  // ROT ZU BEKOMMEN (§6.7, gefahren 18.8.2026): in `v3/LeserRahmenV3.tsx` die
  // Wicklung `panel = { …, umschalten: () => mitAusgleich(…) }` entfernen (dann
  // läuft das Öffnen am Ausgleich vorbei) oder in `v3/useStickAusgleich.ts` die
  // `lage` wieder nur aus `tocOffen` bilden.
  for (const breite of [1024, 1150, 1280]) {
    test(`(e2) @${breite}: das Blatt faltet die Gliederung, die Lesestelle bleibt stehen`, async ({ page }) => {
      await leserLaden(page, breite)
      const abstand = () => page.evaluate(() => {
        const kopf = document.querySelector('[data-v3-kopf]')!.getBoundingClientRect()
        const art = document.getElementById('art-429')!.getBoundingClientRect()
        return Math.round(art.top - kopf.bottom)
      })
      const vorher = await abstand()
      await panelAufziehen(page)
      // Die Faltung muss WIRKLICH stattfinden, sonst prüfte der Fall nichts
      // (§6.7 b): Schiene statt Spalte, und der Kopf trägt jetzt die Such-Zone.
      await expect(page.locator('[data-v3-gliederung-schiene]')).toBeVisible()
      await expect(page.locator('[data-v3-aside]')).toHaveCount(0)
      const nachher = await abstand()
      expect(Math.abs(nachher - vorher),
        `@${breite}: der Abstand Kopf→Artikel wandert um ${nachher - vorher} px (${vorher} → ${nachher})`)
        .toBeLessThanOrEqual(4)
      // Und die Überschrift steht wirklich im Bild — der eigentliche Ä88-Verlust
      // war, dass sie hinter den gewachsenen Kopf rutschte.
      expect(nachher, `@${breite}: die Artikel-Überschrift liegt ${-nachher} px hinter dem Kopf`)
        .toBeGreaterThanOrEqual(-4)
    })
  }

  // ── (g) P1-1 · EIN Klick auf die Schiene, wenn das Blatt ihren Platz hat ───
  // BEFUND (Bug-Check 18.8.2026, Repro `p1/r2-schiene.cjs`, hier @1280
  // nachgemessen): klappt man die Gliederung ZUERST ein und öffnet DANN das
  // Blatt, blieb der Schienen-Griff wirkungslos —
  //
  //   Schritt                     [data-v3-aside]   Grid
  //   ────────────────────────────────────────────────────────────────
  //   Gliederung zu                     0           36px 1004px
  //   Blatt offen                       0           36px 780px 352px
  //   1. Klick auf die Schiene          0           36px 780px 352px   ← nichts
  //   2. Klick auf die Schiene          1           288px 752px
  //
  // Dazwischen stand `tocOffen` still auf `true`: ein Zustand ohne Bild, der
  // beim nächsten Esc als aufspringende Gliederung sichtbar geworden wäre.
  // URSACHE: `rahmenSpalten.schieneHoltPlatz` fragte nach `tocOffen` statt nach
  // der Lage (Herleitung am Feld dort).
  //
  // ROT ZU BEKOMMEN (§6.7, gefahren 18.8.2026): in `v3/rahmenSpalten.ts`
  // `schieneHoltPlatz` wieder auf `blattSpur && tocOffen && !gliederungSpalte`.
  test('(g) @1280: ein Klick auf die Schiene holt die Gliederung zurück — auch von zu', async ({ page }) => {
    const fehler: string[] = []
    page.on('pageerror', (e) => fehler.push(e.message))
    await leserLaden(page, 1280)
    await page.locator('[data-v3-gliederung-zu]').click()
    await expect(page.locator('[data-v3-gliederung-schiene]')).toBeVisible()
    await panelAufziehen(page)
    // Ausgangslage wirklich hergestellt: Schiene UND Blatt-Spur stehen.
    await expect(page.locator('[data-v3-panel-form="spalte"]')).toBeVisible()
    await expect(page.locator('[data-v3-aside]')).toHaveCount(0)

    await page.locator('[data-v3-gliederung-schiene]').click()
    // EIN Klick: die Spalte steht, das Blatt hat ihr den Platz zurückgegeben.
    await expect(page.locator('[data-v3-aside]'), 'nach EINEM Schienen-Klick fehlt die Gliederungsspalte')
      .toBeVisible({ timeout: 10_000 })
    await expect(page.locator('[data-v3-panel]')).toHaveCount(0)
    await expect(page.locator('[data-v3-gliederung-schiene]')).toHaveCount(0)
    expect(fehler, fehler.join(' | ')).toEqual([])
  })
})
