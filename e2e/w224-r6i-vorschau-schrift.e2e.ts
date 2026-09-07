// @shard-gruppe: 6
/**
 * W2·24-NACHZUG R6I · DIE VORSCHAU-INSEL BRICHT BEIM SCHRIFT-SWAP NICHT NEU UM
 * — und der Tieflink landet auf der Leselinie.
 *
 * ── ANLASS (Perf-Tor rot auf main, CI-Lauf 34086372353) ─────────────────────
 * `check:perf-lighthouse` mass `/gesetze/bund/OR` mit **CLS 0.057 > 0.05**.
 * Lokal dreimal byte-gleich reproduziert (Lighthouse-Mobil 412×823, Drossel 4×,
 * PERF_RUNS=3 ⇒ Median 0.0567). Davon war **0.05502 EIN einziger Sprung**, im
 * Trace bei t = 105 ms, Knoten = das `<section>` der prerenderten Insel:
 * `[0,179,412,644]` → `[0,154,412,669]`.
 *
 * URSACHE, gemessen: `#root > main` ist die prerenderte Vorschau-Insel
 * (`src/lib/seo-detail.ts`), die React beim Übernehmen komplett ersetzt. Sie
 * erbte `--font-sans` (seit W2·24-R1 Archivo) und rendert bis zum Eintreffen
 * der woff2 in `'Archivo Fallback'`. `size-adjust` hält den ZEILENKASTEN
 * gleich, nicht den UMBRUCH: die Provenienz-Zeile («OR · SR 220 · Stand … ·
 * amtliche Fassung (geltend) · gegen Fedlex-Konsolidierung geprüft am … ·
 * nächste Fassung ab …») steht @412 dicht an einer Umbruchgrenze und fällt beim
 * Swap von VIER auf DREI Zeilen — `<p>` 102 → 77 px, `<header>` 179 → 154 px.
 * Die 25 px schieben die ganze Insel darunter (930 KB Normtext) nach oben.
 * GEGENPROBE (Playwright 412×823, Drossel 4× + langsames 4G): mit woff2
 * CLS 0.1224 samt Ereignis 0.05502 bei t = 2292 ms — mit
 * `route('**\/*.woff2', abort)` CLS 0.0674 und dieses Ereignis FEHLT.
 *
 * ── WARUM DIESE SPEC DIE SCHRIFTEN VERZÖGERT ────────────────────────────────
 * Gegen einen lokalen `vite preview` ist die woff2 VOR dem ersten Paint da —
 * die Insel malt dann nie im Fallback, und der Defekt wäre unsichtbar (mit
 * ungedrosseltem Netz gemessen: CLS 0.0026, kein Umbruch-Ereignis). Eine Spec,
 * die nur bei zufällig langsamem Netz scheitern kann, ist kein Wächter (§6.7).
 * Darum hält Fall (1) jede Schrift-Antwort um `SCHRIFT_VERZUG_MS` zurück: damit
 * malt die Insel GARANTIERT zuerst im Fallback, und der Swap ist ein Ereignis,
 * das die Spec beobachten kann statt darauf zu hoffen.
 *
 * GEMESSEN WIRD DIE HÖHE, NICHT DER CLS-WERT: die Zusage lautet «der Umbruch
 * der Insel hängt nicht an der Schrift». Eine Höhe ist an genau einer Stelle
 * ablesbar und streut nicht; ein CLS-Summenwert vermischt sie mit jedem
 * anderen Nachzügler der Seite. Der CLS-Deckel bleibt Sache von
 * `check:perf-lighthouse` — diese Spec sagt, WARUM er hält.
 *
 * ROT GESEHEN (§6.7, 7.9.2026): in `src/index.css` die Regel
 * `#root > main, #root > main *` wieder auf `var(--font-sans)` gestellt ⇒
 * Fall (1) rot mit «Vorschau-Insel bricht beim Schrift-Swap um: <header>
 * 179 → 154 px».
 */
import { test, expect } from '@playwright/test';

/** So lange wird jede Schrift-Antwort zurückgehalten (ms). Muss deutlich über
 *  dem ersten Paint liegen, sonst misst die Spec den Swap gar nicht. */
const SCHRIFT_VERZUG_MS = 1200;

/** Der Erlass mit der längsten Provenienz-Zeile und dem grössten Rumpf — die
 *  Lage, in der der Sprung überhaupt gemessen wurde. */
const PFAD = '/gesetze/bund/OR';

test.describe('W2·24-R6I — Vorschau-Insel und Tieflink', () => {
  test('(1) die prerenderte Insel behält ihre Höhe über den Schrift-Swap @412', async ({ page }) => {
    test.slow();
    await page.route('**/*.woff2', async (route) => {
      await new Promise((r) => setTimeout(r, SCHRIFT_VERZUG_MS));
      await route.continue();
    });
    await page.setViewportSize({ width: 412, height: 823 });
    // `commit` statt `load`: die Insel soll im Fallback-Zustand erwischt werden,
    // und `load` wartet gerade auf die Schriften, die diese Spec verzögert.
    await page.goto(PFAD, { waitUntil: 'commit' });

    const insel = page.locator('#root > main');
    const kopf = insel.locator('> header');
    await kopf.waitFor({ state: 'attached', timeout: 20_000 });

    const hoehe = () => kopf.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    const vorher = await hoehe();
    expect(vorher, 'die Vorschau-Insel hat keinen messbaren Kopf').toBeGreaterThan(0);

    // Auf den Swap warten: erst wenn die Schriften geladen SIND, ist die Frage
    // «hat der Swap umgebrochen?» überhaupt beantwortbar.
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, { timeout: 30_000 });
    // Ein Frame Ruhe, damit ein etwaiger Reflow auch wirklich gerechnet ist —
    // sonst misst die Spec den Zustand VOR dem Sprung und wäre nie rot.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

    // Die Insel darf zwischenzeitlich NICHT von React ersetzt worden sein —
    // sonst misst der zweite Wert eine andere Fläche und die Zusage wäre leer.
    await expect(insel, 'React hat die Insel vor dem Swap ersetzt — Messung wertlos').toBeAttached();
    const nachher = await hoehe();
    expect(nachher, `Vorschau-Insel bricht beim Schrift-Swap um: <header> ${vorher} → ${nachher} px`)
      .toBe(vorher);
  });

  test('(2) der Tieflink landet auf der Leselinie und bleibt dort @1440', async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`${PFAD}#art-336_c`);

    const ziel = page.locator('#art-336_c');
    await ziel.waitFor({ state: 'visible', timeout: 30_000 });
    // Der Sprung schwingt nach dem Aufdecken noch ein (`inhalt-hooks-tieflink`:
    // zwei ruhige Frames oder `AUFDECK_MS` = 600 ms). Erst danach messen —
    // vorher misst man die Zwischenlage, nicht das Ergebnis.
    await ziel.evaluate((el) => new Promise<void>((fertig) => {
      let ruhig = 0;
      let letzte = Number.NaN;
      const deckel = window.setTimeout(fertig, 5_000);
      const tick = () => {
        const lage = el.getBoundingClientRect().top;
        ruhig = Math.abs(lage - letzte) <= 1 ? ruhig + 1 : 0;
        letzte = lage;
        if (ruhig >= 10) { window.clearTimeout(deckel); fertig(); return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }));

    // Die LESELINIE ist keine geratene Zahl, sondern `--nt-stick` — dieselbe
    // Quelle, aus der `scroll-margin-top` des `.nt-anker` rechnet
    // (`v3/leserGeometrie.ts`, Risiko R1). Die Spec liest sie am Ziel selbst ab
    // und kann darum nicht still veralten, wenn der Kopf seine Höhe ändert.
    const { oben, leselinie } = await ziel.evaluate((el) => ({
      oben: el.getBoundingClientRect().top,
      leselinie: parseFloat(getComputedStyle(el).scrollMarginTop),
    }));
    expect(Number.isFinite(leselinie), '`--nt-stick` löst am Ziel nicht auf').toBe(true);
    expect(Math.abs(oben - leselinie),
      `Tieflink landet ${Math.round(oben)} px statt auf der Leselinie ${Math.round(leselinie)} px`)
      .toBeLessThanOrEqual(8);

    // Nach dem Einschwingen darf nichts mehr von selbst wandern.
    const vorRuhe = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    await page.waitForTimeout(1_500);
    const nachRuhe = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(nachRuhe - vorRuhe, 'nach dem Sprung wandert die Seite weiter').toBeLessThanOrEqual(0.0005);
  });
});
