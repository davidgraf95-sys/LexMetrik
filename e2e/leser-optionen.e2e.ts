import { test, expect, type Page } from '@playwright/test';

// W2·5d G2a — Leser-Options-Leiste (Linien/Fussnoten/Verweise): reine data-*-/
// CSS-Toggles am <html>, persistent (localStorage) + Pre-Paint (main.tsx, CSP-
// konform ohne Inline-Script). Belegt R6 (Grundzustand = heutige Darstellung,
// Toggle rein CSS) und R9 (Fussnoten-«AUS» DÄMPFT, versteckt NIE — Ctrl+F/
// Screenreader/Print bleiben). Positiv UND negativ (AN sichtbar ↔ AUS reduziert).
//
// Der Reader liefert prerendertes Crawler-HTML → auf den Client-Takeover warten
// (die Options-Leiste existiert NUR im React-DOM = App-Ready-Marker), bevor
// geklickt wird. Erlass-Wahl: die Toggle-Semantik ist seitengrössen-unabhängig
// (Attribut + CSS) — Fussnoten/Verweise laufen darum auf dem KLEINEN BGBM
// (~22 KB Snapshot, 25 Fussnoten-Marker, 62 Verweis-Links), NICHT auf dem
// 1686-Artikel-OR: dessen Voll-Re-Render (Apparat-Toggle) + Ganzseiten-Style-
// Recalc starvten den gedrosselten CI-Runner ins 30s-Test-Timeout (CI-Befund
// 4.7.2026, Run 28711156193 — lokal auch mit 20×-CPU-Throttle nicht
// reproduzierbar).
//
// W2·5d G2b (Flake-Härtung): der Linien-Toggle lief bisher auf dem grossen ZGB
// (~1277 Art., #art-684 tief) und war am gedrosselten Runner nahe dem Timeout.
// Er zieht auf den kleinen, ABER geschachtelten Erlass BV (~232 Art., #art-8 mit
// Guide über tiefe===1) um — @6×-CPU-Throttle-Probe: BV ready≈1,0 s / toggle≈1,3 s
// vs. ZGB ready≈2,5 s / toggle≈4,1 s (≈3× schneller), Assertions unverändert
// scharf (Guide sichtbar → transparent, Element bleibt, Einzug kollabiert). Die
// R4-TIEFEN-Referenz (≤1 Guide-Stapel, ZGB Art. 684) bleibt CI-fest in
// `leser-linien-kanon.e2e.ts`.

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: der «Ansicht»-Trigger (U-KOPF/A4) rendert nur der Client (nicht im
  // Crawler-HTML) — erst danach hängen die React-Handler.
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(200);
}

// W2·5d U-KOPF/A4: die Switches liegen jetzt im «Ansicht»-Dropdown — vor jedem
// Switch-Zugriff öffnen. Das Panel (role=group) ist absolut positioniert (kein
// Layout-Shift der Seite) und trägt aria-label="Darstellungsoptionen".
async function ansichtOeffnen(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ansicht' }).first().click();
  await expect(page.locator('[aria-label="Darstellungsoptionen"]').first()).toBeVisible();
}

/** Farbe/Breite/Padding der ersten gerenderten Guide-Kante über einem Artikel. */
async function guide(page: Page, artId: string) {
  return page.evaluate((id) => {
    let el: HTMLElement | null = document.getElementById(id)?.parentElement ?? null;
    while (el) {
      if (el.matches('section[data-normtext-linie]')) {
        const cs = getComputedStyle(el);
        if (cs.borderLeftStyle !== 'none' && parseFloat(cs.borderLeftWidth) > 0) {
          return { color: cs.borderLeftColor, width: cs.borderLeftWidth, padding: cs.paddingLeft };
        }
      }
      el = el.parentElement;
    }
    return null;
  }, artId);
}

test('Options-Leiste: vier role=switch (V2·B-1 «Entscheide»); Fussnoten/Verweise/Entscheide an, Linien-Default aus (V2·A28, Auto-Guide korpusweit zurückgezogen)', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  await ansichtOeffnen(page);
  const gruppe = page.locator('[aria-label="Darstellungsoptionen"]').first();
  await expect(gruppe).toBeVisible();
  // V2·B-1 (David 10.7.2026, überstimmt «genau drei Toggles», A19+): 4. Schalter
  // «Entscheide» im Dropdown. BGBM hat eine Gliederungs-Sektion → der Linien-Schalter
  // ERSCHEINT (zeigeLinien=guideEbene!==null, feature-abhängig, unverändert) ⇒ 4 Switches.
  await expect(gruppe.getByRole('switch')).toHaveCount(4);
  // V2·A28 (David 12.7.2026, Live-Verdikt «funktioniert überhaupt nicht»): der Auto-
  // Guide ist KORPUSWEIT aus → data-guide-auto="aus", der Linien-Schalter zeigt
  // ehrlich «aus» (§8). Das FEATURE bleibt: ein Klick «Linien AN» zeigt den Guide.
  // Fussnoten/Verweise bleiben unverändert an (R6-No-op).
  await expect(page.locator('.lc-leser').first()).toHaveAttribute('data-guide-auto', 'aus');
  await expect(gruppe.getByRole('switch', { name: 'Linien' })).toHaveAttribute('aria-checked', 'false');
  for (const name of ['Fussnoten', 'Verweise']) {
    await expect(gruppe.getByRole('switch', { name })).toHaveAttribute('aria-checked', 'true');
  }
  await expect(gruppe.getByRole('switch', { name: 'Entscheide' })).toHaveAttribute('aria-checked', 'true');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-linien', 'auto');
  await expect(html).toHaveAttribute('data-fussnoten', 'an');
  await expect(html).toHaveAttribute('data-verweise', 'an');
  await expect(html).toHaveAttribute('data-leitfaelle', 'an');
});

test('Linien-Toggle: Auto-Default transparent (V2·A28), Nutzer «an» zeigt / «aus» versteckt den Guide, persistiert über Reload', async ({ page }) => {
  // BV ist eine tiefe Struktur (Gliederungstiefe 3, dichte 8). V2·A28 (David 12.7.,
  // Live-Verdikt «funktioniert überhaupt nicht»): der Auto-Guide ist korpusweit
  // zurückgezogen (data-guide-auto="aus") — auch die tiefe Kodifikation drängt die
  // Linie nicht mehr auf. Der border-Container BLEIBT im DOM (nur transparent).
  await warteReader(page, '/gesetze/bund/BV#art-8', 'art-8');
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'auto');
  await expect(page.locator('.lc-leser').first()).toHaveAttribute('data-guide-auto', 'aus');
  const autoAus = await guide(page, 'art-8');
  expect(autoAus, 'Guide-Container existiert (auch im Auto-Default)').not.toBeNull();
  expect(parseFloat(autoAus!.width)).toBeGreaterThan(0);
  expect(autoAus!.color).toBe('rgba(0, 0, 0, 0)'); // V2·A28: Auto-Guide korpusweit aus

  // A4: Switches liegen im «Ansicht»-Dropdown — öffnen (bleibt über die Klicks offen).
  await ansichtOeffnen(page);
  // POSITIV: der Auto-Default ist effektiv AUS → erster Klick setzt explizit «Linien
  // AN» (K11-Tri-State übersteuert global) → der EINE Guide auf `guideEbene` wird
  // sichtbar. Das FEATURE bleibt voll funktionsfähig, nur das Aufdrängen endete.
  await page.getByRole('switch', { name: 'Linien' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'an');
  const an = await guide(page, 'art-8');
  expect(an, 'Guide-Container bleibt strukturell erhalten').not.toBeNull();
  expect(parseFloat(an!.width)).toBeGreaterThan(0);
  expect(an!.color).not.toBe('rgba(0, 0, 0, 0)'); // Nutzer-«an» → Guide sichtbar

  // NEGATIV: zweiter Klick → «Linien» explizit AUS → Kante transparent, Einzug
  // kollabiert (flach), Element (border-Breite > 0) BLEIBT — kein display-Wechsel.
  await page.getByRole('switch', { name: 'Linien' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'aus');
  const aus = await guide(page, 'art-8');
  expect(aus!.color).toBe('rgba(0, 0, 0, 0)'); // transparent
  expect(aus!.padding).toBe('0px'); // Einzug kollabiert (flach)

  // Persistenz + Pre-Paint: Reload stellt data-linien=aus wieder her.
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  expect(ls).toContain('"linien":"aus"');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-linien', 'aus');
  await expect(page.locator('#art-8')).toBeVisible();
  const nachReload = await guide(page, 'art-8');
  expect(nachReload!.color).toBe('rgba(0, 0, 0, 0)'); // kein Flash: bleibt aus
});

test('Fussnoten-Toggle: AN sichtbar → AUS VERSCHWINDEN (A1, David 5.7.2026), Text bleibt im DOM, kein CLS beim Toggle', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');

  // A1 (David 5.7.2026, überstimmt die frühere R9-Dämpfungs-Regel): Fussnoten bei
  // AUS VERSCHWINDEN visuell (display:none am `[data-fn-marker]`-Cluster und am
  // `[data-fn-apparat]`), statt nur gedämpft zu werden. Trade-off: die Marker-
  // Ziffern + Apparat-Texte verlassen Ctrl+F — NUR sie, nie der Normtext; der
  // Fussnotentext bleibt im DOM (`#fn-…`) und «Fussnoten AN» stellt alles wieder her.
  const marker = page.locator('.lc-leser button[aria-label^="Fussnote"]').first();
  await expect(marker).toBeVisible({ timeout: 15000 });
  const nrText = (await marker.textContent())?.trim() ?? '';
  expect(nrText.length).toBeGreaterThan(0);

  // A4: Switches liegen im «Ansicht»-Dropdown — öffnen (absolut positioniert,
  // kein Layout-Shift der Seite), dann den CLS-Beobachter installieren.
  await ansichtOeffnen(page);

  // CLS-Beobachter INSTALLIEREN (NUR künftige Shifts, kein `buffered` — die
  // Lade-Shifts sind nicht Gegenstand des Toggle-Beweises), dann togglen: ein
  // toggle-getriebener Reflow liegt binnen 500 ms nach dem Klick (input-exkludiert)
  // und darf KEINEN CLS beitragen.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // NEGATIV: «Fussnoten» AUS → Marker + Apparat visuell WEG (display:none), aber
  // der Marker bleibt im DOM (Text abfragbar), niemals gelöscht.
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(marker).toBeHidden();
  expect(await marker.evaluate((el) => getComputedStyle(el).display)).toBe('none');
  // Text bleibt im DOM (Element existiert, Inhalt unverändert) — nur visuell weg.
  expect((await marker.textContent())?.trim()).toBe(nrText);
  await expect(page.locator('.lc-leser [data-fn-apparat]').first()).toBeHidden();

  // POSITIV zurück: «Fussnoten» AN → Marker wieder sichtbar (Wiederherstellung).
  await page.getByRole('switch', { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'an');
  await expect(marker).toBeVisible();

  // CLS über beide Toggles == 0 (input-exkludiert): kein Layout-Sprung.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBe(0);
});

test('Verweise-Toggle: AUS unterdrückt die (dotted) Link-Unterstreichung, der Link bleibt', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-1');
  // Artikel-Fliesstext-Verweis (U-VERWEIS/A11: auch der Ingress trägt jetzt
  // dotted Links — der läge unter dem Sticky-Kopf und finge den Hover ab).
  const link = page.locator('.lc-leser [id^="art-"] .decoration-dotted').first();
  const anzahl = await page.locator('.lc-leser [id^="art-"] .decoration-dotted').count();
  test.skip(anzahl === 0, 'kein Verweis-Link auf dieser Seite');

  await link.scrollIntoViewIfNeeded();
  // POSITIV: Grundzustand → :hover unterstreicht (heutiges Verhalten).
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain('underline');

  // NEGATIV: «Verweise» AUS (im «Ansicht»-Dropdown) → keine Unterstreichung, aber
  // Link (href/Klick) bleibt.
  await ansichtOeffnen(page);
  await page.getByRole('switch', { name: 'Verweise' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-verweise', 'aus');
  await link.hover();
  expect(await link.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('none');
});
