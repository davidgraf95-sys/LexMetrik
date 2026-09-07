// @shard-gruppe: 2
// ── W2·24-R6c · DIE BEZÜGE-ZEILE ZÄHLT OHNE DEN SHARD ──────────────────────
//
// BEFUND (Prüfer R6, 6.9.2026, «ZÄHL-DATEI»): die Bezüge-Zeile am Artikelkopf
// (D20 (b)) nannte ihre Entscheid-Zahl erst, wenn der volle Bezugs-Shard
// geladen war (OR 2.2 MB roh), und die Rubrik «Materialien» gar nicht — deren
// Shard kommt im Leser nicht vor, und eine Rubrik ohne Zahl wäre eine Zusage
// ohne Deckung gewesen (§8).
//
// GEBAUT: eine buildseitige Zähl-Datei je Erlass
// (`scripts/gen-bezuege-zaehler.ts` → `public/verzahnung/bezuege-zaehler/
// <KEY>.json`, ø 289 B, grösste 5.8 KB beim OR). Sie trägt NUR Zahlen; das
// ÖFFNEN der Zeile lädt weiterhin lazy den vollen Apparat.
//
// DREI ZUSAGEN:
//  (a) Die Zahl steht da — und sie ist die richtige (OR 336c: 11 Entscheide,
//      dieselbe Zahl, die der Shard ungefiltert führt).
//  (b) Die Rubrik «Materialie» ist da, wo es eine gibt (ARG 15a).
//  (c) DER PREIS: dafür geht KEIN Bezugs- und KEIN Materialien-Shard über die
//      Leitung, nur die Zähl-Datei. Ohne (c) wäre der ganze Bau sinnlos.
//
// ROT ZU BEKOMMEN (§6.7): in `v3/LeserLesespalte.tsx` die Prop `zaehler`
// weglassen — (a) fällt auf die alte Quelle zurück (ohne Shard: 0, Rubrik weg)
// und (b) verschwindet ganz.
import { test, expect, type Page } from '@playwright/test';

/** Welche schweren Shards hat die Seite angefasst? */
function shardSonde(page: Page): string[] {
  const gesehen: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('/rechtsprechung/bezuege/') || u.includes('/materialien/kanten/')) {
      gesehen.push(u.slice(u.indexOf('/', 8)));
    }
  });
  return gesehen;
}

async function zeile(page: Page, artikel: string): Promise<string> {
  const el = page.locator(`#art-${artikel} .lr7-bez-zeile`);
  await expect(el, `keine Bezüge-Zeile an Art. ${artikel}`).toHaveCount(1, { timeout: 20_000 });
  return (await el.innerText()).replace(/\s+/g, ' ').trim();
}

test.describe('R6c · Bezüge-Zeile aus der Zähl-Datei', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('(a)+(c) OR 336c nennt 11 Entscheide — ohne einen einzigen Shard', async ({ page }) => {
    const schwer = shardSonde(page);
    await page.goto('/gesetze/bund/OR#art-336_c');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    // Die Zähl-Datei kommt im Leerlauf — Zeit lassen, aber nicht endlos.
    await expect(page.locator('#art-336_c .lr7-bez-marke[data-reg="r"]'))
      .toHaveText(/11\s*Entscheide/, { timeout: 20_000 });
    const t = await zeile(page, '336_c');
    expect(t, `Bezüge-Zeile: «${t}»`).toContain('11');
    // (c) — der Preis, den der Bau eingespart hat.
    await page.waitForTimeout(1_500);
    expect(schwer, `schwere Shards geladen: ${schwer.join(', ')}`).toEqual([]);
  });

  test('(b) ARG 15a nennt «1 Materialie» — die Rubrik, die es vorher nicht gab', async ({ page }) => {
    const schwer = shardSonde(page);
    await page.goto('/gesetze/bund/ARG#art-15_a');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('#art-15_a .lr7-bez-marke[data-reg="m"]'))
      .toHaveText(/1\s*Materialie/, { timeout: 20_000 });
    await page.waitForTimeout(1_500);
    expect(schwer, `schwere Shards geladen: ${schwer.join(', ')}`).toEqual([]);
  });
});
