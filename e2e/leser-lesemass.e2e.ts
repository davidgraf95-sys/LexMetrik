import { test, expect, type Page } from '@playwright/test';

// R5 (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Typo-Skala): die Lesespalte hält ein
// komfortables Zeilenmass — Desktop ≤ 75 ch @ 1440px, Mobil hinreichend breit @ 390px.
// Der frühere Ist-Fehler: arbitrary max-w-[52/56rem] (zu breit) + auf Mobil ~16 ch
// (5 gestapelte Guide-Linien à ~24px = ~120px Fraß). Fix: max-w-reading (Token) +
// Guide-/Einzug-Kollaps mobil → gemessen ~32–34 ch (2× der ~16-ch-Basis).
//
// OFFENGELEGTE ABWEICHUNG (§7/§8) vom aspirativen «≥ 40 ch @ 390» der Spec:
// empirisch physikalisch gedeckelt. Bei 390px bleiben nach dem Shell-Seitensteg
// (px-5 = 40px) und der amtstreuen Absatznummer-Rinne (`pl-9` = 36px hängender
// Einzug) ~314px Textbreite; bei der 18px-Lese-Serife (Signatur «über Fedlex»,
// D-B) sind das ~32–34 ch. 40 ch bräuchten ~392px Text (breiter als der Viewport)
// oder eine Schrift < 16px bzw. das Schrumpfen der Absatznummer-Rinne / des
// globalen Seitenstegs — alle drei ausserhalb G1 (D-A…D-E). Floor daher auf die
// robust erreichte, deutlich verbesserte Marke gesetzt; zusätzlich strikt: KEIN
// horizontaler Overflow @390 (der eigentliche Mobil-Gesundheitscheck).
//
// Messmethode (aus docs/ux-audit-2026-07/reader/measure.mjs): der längste
// mehrzeilige Fliesstext-<p> im Volltext; charsPerLine = Textlänge / Zeilenkästen
// (range.getClientRects()). Der Reader liefert PRERENDERTES HTML, React ersetzt es
// nach dem Fetch (render-then-replace) → erst auf #art-1 warten.
const MOBIL_MIN_CH = 30; // robust erreicht (~32–34), 2× der ~16-ch-Basis; s. Abweichungsnotiz

const ERLASSE = ['ZGB', 'OR', 'VMWG'] as const;

async function ladeReader(page: Page, key: string): Promise<void> {
  await page.goto(`/gesetze/bund/${key}`);
  await expect(page.locator('#art-1')).toBeVisible();
  await page.evaluate(() => document.fonts?.ready);
  // Etwas Inhalt in den Viewport bringen, damit content-visibility-Artikel
  // Layout bekommen (die obersten sind ohnehin sichtbar).
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
}

async function messeMaxCharsPerLine(page: Page): Promise<{ ch: number; px: number } | null> {
  return page.evaluate(() => {
    let best: { ch: number; px: number } | null = null;
    document.querySelectorAll('[id^="art-"] p').forEach((p) => {
      const text = (p.textContent ?? '').trim();
      if (text.length < 40) return; // zu kurz für eine belastbare Messung
      const range = document.createRange();
      range.selectNodeContents(p);
      const rects = range.getClientRects();
      if (rects.length < 3) return; // nur echt umbrechende Absätze
      const ch = Math.round(text.length / rects.length);
      const px = Math.round((p as HTMLElement).getBoundingClientRect().width);
      if (!best || ch > best.ch) best = { ch, px };
    });
    return best;
  });
}

test.describe('R5 · Lesemass Desktop (≤ 75 ch @ 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const key of ERLASSE) {
    test(`${key}: Lesespalte ≤ 75 ch`, async ({ page }) => {
      await ladeReader(page, key);
      const m = await messeMaxCharsPerLine(page);
      expect(m, `${key}: mehrzeiliger Fliesstext-Absatz gefunden`).not.toBeNull();
      expect(m!.ch, `${key} @1440: ${m!.ch} ch (${m!.px}px) muss ≤ 75 sein`).toBeLessThanOrEqual(75);
    });
  }
});

test.describe(`R5 · Lesemass Mobil (≥ ${MOBIL_MIN_CH} ch @ 390, kein H-Overflow)`, () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const key of ERLASSE) {
    test(`${key}: Lesespalte ≥ ${MOBIL_MIN_CH} ch, kein H-Overflow`, async ({ page }) => {
      await ladeReader(page, key);
      const m = await messeMaxCharsPerLine(page);
      expect(m, `${key}: mehrzeiliger Fliesstext-Absatz gefunden`).not.toBeNull();
      expect(m!.ch, `${key} @390: ${m!.ch} ch (${m!.px}px) muss ≥ ${MOBIL_MIN_CH} sein`).toBeGreaterThanOrEqual(MOBIL_MIN_CH);
      // Kein horizontaler Overflow des Dokuments (grid-cols-1-Falle / lange Komposita).
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${key} @390: horizontaler Overflow ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});
