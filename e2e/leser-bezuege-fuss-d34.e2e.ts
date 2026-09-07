// @shard-gruppe: 2
// ── W2·24-D34 · DIE BEZÜGE-ZEILE STEHT AM ARTIKELENDE ───────────────────────
//
// AUFTRAG David 7.9.2026, wörtlich: «das mit den bezügen soll unten an den
// artikel und nicht direkt nach der artikel nummer».
//
// Bis D33 sass die Zeile «Bezüge · 11 Entscheide · 1 Rechner ›» in der
// Breitform DIREKT unter der Artikelnummer — zwischen der Überschrift und dem
// Wortlaut, den sie überschreibt. Sie steht jetzt am FUSS: unter dem letzten
// Absatz und unter dem Fussnoten-Apparat, vor dem nächsten Artikel.
//
// VIER ZUSAGEN, je einzeln messbar:
//  (a) ORT — die Zeile liegt UNTER dem letzten Absatz des Artikels (und unter
//      dem Fussnoten-Apparat, wo einer steht) und noch INNERHALB des Artikels,
//      also VOR dem nächsten. Das ist Davids Satz, in Pixeln.
//  (b) NICHT MEHR AM KOPF — zwischen Artikelnummer und erstem Absatz liegt
//      keine Bezüge-Zeile mehr. Ohne (b) wäre (a) auch mit einer ZWEITEN Zeile
//      am Fuss erfüllt.
//  (c) EIN BAUSTEIN FÜR BEIDE FORMEN — @390 (Zeilenform) steht dieselbe EINE
//      Zeile am selben Ort. Bis D33 hatte die schmale Form einen eigenen,
//      anders gestalteten Artikelfuss (offene Verweis-Chips + unbedingte
//      Rechtsprechungs-Zeile): zwei Gestalten für einen Fachinhalt (§5).
//  (d) DIE TRENNLINIE — die Zeile trägt oben eine feine Linie (Linien statt
//      Flächen, F0.6). Am Kopf brauchte sie keine, am Fuss klebte sie ohne sie
//      am Fliesstext, den sie nicht fortsetzt.
//
// ROT ZU BEKOMMEN (§6.7), belegt in `abnahme/design-identitaet/R6J-BEZUEGE-FUSS.md`:
//  · in `parts/ArtikelLeser.tsx` den `<ArtikelBezuegeFuss …>` wieder VOR den
//    `{artOffen && (…)}`-Block ziehen (= die Kopf-Position von D33)
//        ⇒ (a) rot @1440 und @390, (b) rot
//  · in `src/index.css` `border-top` an `.lr7-bez` löschen ⇒ (d) rot
import { test, expect, type Page } from '@playwright/test';

const ART = '336_c';

/** Unterkante des letzten sichtbaren Wortlaut-Absatzes dieses Artikels. */
async function fussDesWortlauts(page: Page): Promise<number> {
  return page.evaluate((art) => {
    const a = document.querySelector(`#art-${art}`);
    if (!a) throw new Error(`Artikel ${art} nicht im DOM`);
    // Der Wortlaut steht in der Lesespalte (`.max-w-normtext`); der
    // Fussnoten-Apparat (`[data-fn-apparat]`) und die Beiwerk-Zone folgen ihm.
    // Gemessen wird die UNTERSTE Kante von beidem — die Bezüge-Zeile muss unter
    // ALLEM liegen, was zum Artikel gehört, nicht nur unter dem Fliesstext.
    const teile = [...a.querySelectorAll('.max-w-normtext, [data-fn-apparat], [data-beiwerk]')];
    const unten = teile
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.height > 0)
      .map((r) => r.bottom);
    if (unten.length === 0) throw new Error(`Artikel ${art} zeigt keinen Wortlaut`);
    return Math.max(...unten);
  }, ART);
}

/** Geometrie der Bezüge-Zeile + der Artikelnummer + des nächsten Artikels. */
async function lage(page: Page) {
  return page.evaluate((art) => {
    const a = document.querySelector(`#art-${art}`)!;
    const bez = a.querySelector('.lr7-bez');
    if (!bez) throw new Error(`keine Bezüge-Zeile an Art. ${art}`);
    const artikel = [...document.querySelectorAll('article[id^="art-"]')];
    const idx = artikel.indexOf(a as HTMLElement);
    const naechster = artikel[idx + 1]?.getBoundingClientRect().top ?? Infinity;
    // Die Artikelnummer selbst («Art. 336c») — Anker ODER Treffer-Knopf.
    const nummer = a.querySelector(`a[href$="#art-${art}"], button`)!.getBoundingClientRect();
    const stil = getComputedStyle(bez);
    return {
      anzahl: a.querySelectorAll('.lr7-bez').length,
      bezOben: bez.getBoundingClientRect().top,
      bezUnten: bez.getBoundingClientRect().bottom,
      nummerUnten: nummer.bottom,
      naechsterOben: naechster,
      linieOben: stil.borderTopWidth,
      linieFarbe: stil.borderTopColor,
    };
  }, ART);
}

async function oeffne(page: Page): Promise<void> {
  await page.goto(`/gesetze/bund/OR#art-${ART}`);
  await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
  // Die Zähl-Datei kommt im Leerlauf; erst mit ihr steht die Zeile überhaupt da.
  await expect(page.locator(`#art-${ART} .lr7-bez-marke[data-reg="r"]`))
    .toHaveText(/\d+\s*Entscheide?/, { timeout: 20_000 });
}

test.describe('D34 · die Bezüge-Zeile steht am Artikelende', () => {
  test('(a)+(b)+(d) @1440: unter dem letzten Absatz, nicht unter der Artikelnummer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await oeffne(page);
    const wortlautUnten = await fussDesWortlauts(page);
    const l = await lage(page);

    // (b) GENAU EINE Zeile am Artikel — kein zweiter Ort daneben (§5).
    expect(l.anzahl, `Art. ${ART} trägt ${l.anzahl} Bezüge-Zeilen`).toBe(1);

    // (a) UNTER dem Wortlaut. `-1` als Rundungs-Spielraum der Sub-Pixel-Kanten;
    // der Ist-Fehler (Kopf-Position) liegt hunderte Pixel darüber, nicht eines.
    expect(l.bezOben, `Bezüge-Zeile bei y=${l.bezOben}, Wortlaut endet bei y=${wortlautUnten}`)
      .toBeGreaterThanOrEqual(wortlautUnten - 1);

    // (a) und NOCH IM ARTIKEL — vor dem nächsten.
    expect(l.bezUnten, `Bezüge-Zeile endet bei y=${l.bezUnten}, nächster Artikel beginnt bei y=${l.naechsterOben}`)
      .toBeLessThanOrEqual(l.naechsterOben + 1);

    // (b) NICHT direkt nach der Artikelnummer — Davids Satz, negativ gemessen.
    // Zwischen Nummer und Zeile MUSS der Wortlaut liegen; die Zeile sitzt damit
    // deutlich tiefer als eine Zeilenhöhe unter der Nummer.
    expect(l.bezOben - l.nummerUnten,
      `nur ${Math.round(l.bezOben - l.nummerUnten)} px zwischen Artikelnummer und Bezüge-Zeile — sie klebt wieder am Kopf`)
      .toBeGreaterThan(48);

    // (d) Die feine Trennlinie über der Zeile.
    expect(l.linieOben, 'die Bezüge-Zeile trägt keine Trennlinie nach oben').not.toBe('0px');
    expect(l.linieFarbe, 'die Trennlinie ist unsichtbar (transparent)').not.toMatch(/rgba\(0, 0, 0, 0\)/);
  });

  test('(c) @390: dieselbe EINE Zeile am selben Ort — ein Fuss-Baustein für beide Formen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await oeffne(page);
    const wortlautUnten = await fussDesWortlauts(page);
    const l = await lage(page);
    expect(l.anzahl, `Art. ${ART} trägt @390 ${l.anzahl} Bezüge-Zeilen`).toBe(1);
    expect(l.bezOben, `@390 Bezüge-Zeile bei y=${l.bezOben}, Wortlaut endet bei y=${wortlautUnten}`)
      .toBeGreaterThanOrEqual(wortlautUnten - 1);
    expect(l.bezUnten, `@390 Bezüge-Zeile endet bei y=${l.bezUnten}, nächster Artikel beginnt bei y=${l.naechsterOben}`)
      .toBeLessThanOrEqual(l.naechsterOben + 1);
    // Und die Zeile ist dieselbe: Registerfarben-Marken statt der alten,
    // offenen Chip-Reihe der Zeilenform (die es nicht mehr gibt).
    await expect(page.locator(`#art-${ART} .lr7-bez-marke`).first()).toBeVisible();
  });
});
