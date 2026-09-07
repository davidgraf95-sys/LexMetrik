// @shard-gruppe: 2
// ── P3 · TEXTLINKS IM GESETZESLESER TRAGEN EINEN UNTERSTRICH ────────────────
//
// BEFUND (Prüfer R6, 6.9.2026, Bau-Runde W2·24-DESIGN-IDENTITAET): von 6'291
// Links im Gesetzesleser trugen 3'673 keinen Unterstrich — «Amtliche Fassung ↗»
// im Erlasskopf, «⬇ Amtliches PDF», die Links der Bezüge. Ein Link, den allein
// die Farbe ausweist, ist für Farbfehlsichtige kein Link (WCAG 1.4.1 «Use of
// Color»). Derselbe Befund traf auf der Startseite als R3-F1 auf.
//
// DIE REGEL STEHT EINMAL, in `src/index.css` («TEXTLINKS IM LESER»):
// `.lc-leser :where(a[href])` unterstreicht als VORGABE. Weil sie in einer
// Cascade-Layer liegt und `:where()` die Spezifität auf null hält, gewinnt die
// Tailwind-Utility `no-underline` immer — wer ohne Strich stehen soll, sagt es
// im Markup.
//
// WAS DIESER FALL ZUSICHERT — zwei Hälften, die einander decken:
//  (a) NEGATIV: kein Link ohne Strich, der nicht ausdrücklich `no-underline`
//      trägt. Ohne (b) wäre das trivial erfüllbar, indem man überall
//      `no-underline` schreibt.
//  (b) POSITIV: die drei Textlink-Sorten, die der Befund benannt hat, tragen
//      den Strich WIRKLICH — die Fedlex-Links im Erlasskopf und die Links der
//      Bezüge-Zeile.
//
// WER OHNE STRICH STEHEN DARF (erklärt, nicht bloss geduldet): Brotkrume und
// Gliederung (Navigation), die Artikelnummer-Anker (`num … no-underline` in
// `ArtikelLeser` — die Zahl IST die Überschrift), sowie alles mit `.lc-chip`
// oder `.lc-btn-mini`: beide sind bordierte Bedienformen, deren Affordanz die
// Linie ist, nicht die Farbe. WCAG 1.4.1 verlangt ein NICHT-farbliches
// Unterscheidungsmerkmal, keinen Unterstrich im Besonderen.
//
// ROT ZU BEKOMMEN (§6.7): in `src/index.css` den Block «TEXTLINKS IM LESER»
// entfernen — Fall (b) reisst sofort mit den Bezüge-Links. Belegt am
// 6.9.2026 im Bau von R6c.
import { test, expect } from '@playwright/test';

const ORT = '/gesetze/bund/OR#art-336_c';

test.describe('P3 · Links im Gesetzesleser', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('kein Textlink ohne Unterstrich — und die benannten tragen ihn wirklich', async ({ page }) => {
    await page.goto(ORT);
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(400);
    // Die Bezüge-Zeile aufklappen — ihre Links sind der Kern des Befunds und
    // liegen eingeklappt nicht im Layout.
    const zeile = page.locator('#art-336_c .lr7-bez-zeile').first();
    if (await zeile.count()) {
      const offen = await page.locator('#art-336_c .lr7-bez').first().evaluate((d) => (d as HTMLDetailsElement).open);
      if (!offen) await zeile.click();
      await page.waitForTimeout(250);
    }

    const mess = await page.evaluate(() => {
      const nackt: string[] = [];
      let gesamt = 0, unterstrichen = 0;
      document.querySelectorAll('.lc-leser a[href]').forEach((a) => {
        gesamt++;
        if (getComputedStyle(a).textDecorationLine.includes('underline')) { unterstrichen++; return; }
        // Erklärte Ausnahme? Dann ist der fehlende Strich eine Entscheidung.
        const c = a.className || '';
        if (/(^|\s)no-underline(\s|$)/.test(c) || a.closest('.lc-chip, .lc-btn-mini')) return;
        if (nackt.length < 12) nackt.push(`${(a.textContent ?? '').trim().slice(0, 40)} [${c.slice(0, 60)}]`);
      });
      // (b) die benannten Textlinks
      const bezug = document.querySelector('#art-336_c .lr7-bez a[href]');
      const kopf = [...document.querySelectorAll('.lc-leser a[href]')]
        .find((a) => /Amtliche Fassung/.test(a.textContent ?? '') && !a.closest('.lc-chip, .lc-btn-mini'));
      const strich = (el: Element | null | undefined) =>
        el ? getComputedStyle(el).textDecorationLine.includes('underline') : null;
      return { gesamt, unterstrichen, nackt, bezugDa: !!bezug, bezugStrich: strich(bezug), kopfDa: !!kopf, kopfStrich: strich(kopf) };
    });

    // Leer-Treffer-Schutz: der Fall muss überhaupt Links gesehen haben.
    expect(mess.gesamt, 'kein einziger Link im Leser gemessen').toBeGreaterThan(100);
    // (a)
    expect(mess.nackt, `Links ohne Unterstrich und ohne erklärte Ausnahme:\n${mess.nackt.join('\n')}`)
      .toEqual([]);
    // (b) — ohne diese Hälfte wäre (a) mit `no-underline` überall erfüllbar.
    expect(mess.bezugDa, 'kein Link in der Bezüge-Zeile von OR 336c gefunden — der Positiv-Fall misst nichts').toBe(true);
    expect(mess.bezugStrich, 'die Links der Bezüge-Zeile stehen wieder ohne Unterstrich').toBe(true);
    expect(mess.kopfDa, 'kein Fedlex-Textlink gefunden — der Positiv-Fall misst nichts').toBe(true);
    expect(mess.kopfStrich, '«Amtliche Fassung ↗» steht wieder ohne Unterstrich').toBe(true);
  });
});
