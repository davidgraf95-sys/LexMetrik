// @shard-gruppe: 5
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ANSICHT_PANEL, SCHALTER_ROLLE, VERMERKE_SCHALTER_NAME } from './helpers/leserBeschriftung';

// ÄNDERUNGSVERMERKE: AN/AUS — zweiwertig seit S1, ENTKOPPELT seit Ä68
// (Entscheid David 17.8.2026 abends, FAHRPLAN-LESER-V3 Kap. 4f/7).
//
// ── DEKLARIERTE FACHLICHE ÄNDERUNG (§6.3), zweite Stufe ──────────────────────
// DAVIDS BEFUND, wörtlich: «wenn änderungsvermerke abgewählt wird dann
// verschwinden auch fussnoten.» Er traf zu. Gemessen 17.8.2026 @1440 in der
// Stellung Fussnoten = an · Änderungsvermerke = aus:
//
//   StPO   Apparat-Einträge sichtbar 285 → 98   · Marker 285 → 105
//   ZGB    Apparat-Einträge sichtbar 809 → 90   · Marker 809 → 173
//
// Ursache waren die beiden CSS-Regeln auf `[data-fn-klasse="A"]` und auf den
// A-only-Apparat: weil `kl:'A'` beim Bundesrecht die REGEL ist (ZGB 719/809), war
// «Änderungsvermerke aus» faktisch ein zweiter, versteckter Fussnoten-Schalter.
//
// DIE NEUE, EINE WAHRHEIT — zwei Schalter, zwei disjunkte Flächen:
//   Fussnoten-Schalter          Marker UND Apparat, ALLE Klassen (auch `kl:'A'`)
//   Änderungsvermerke-Schalter  NUR die abgeleitete Fassungs-Zeile
//                               (`[data-hist-slot]`: «Gilt seit …» + Zeitleiste)
//
// WAS DAS FÜR DIESE DATEI HEISST: die Zusicherungen zur A-Klasse KEHREN SICH UM.
// Wo bis 17.8. `toBeHidden()` stand, steht jetzt `toBeVisible()` — nicht als
// Lockerung, sondern weil die Sache gegenteilig entschieden ist. Der Vertrag ist
// dabei nicht schwächer geworden: jede umgekehrte Zusicherung bleibt eine
// ZWEISEITIGE Sonde (A sichtbar bei Vermerke=aus UND A unsichtbar bei
// Fussnoten=aus), und die 2×2-Matrix unten prüft alle vier Stellungen zugleich —
// das gab es vorher nicht.
//
// ── DIE NICHT VERHANDELBARE AUFLAGE, JETZT STRENGER ERFÜLLT ──────────────────
// H0-Auflage 1 (Vollbericht `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`,
// Nachtrag 17.8.2026) verlangte: echte Verweise (V), Grauzone (G),
// Publikationsnachweise (Z), Unklares (U) und alles OHNE Klasse bleiben vom
// Vermerke-Schalter unberührt. Das gilt jetzt für JEDE Klasse — der Schalter fasst
// den Fussnoten-Apparat überhaupt nicht mehr an. Geprüft wird darum weiterhin
// nicht nur, DASS «aus» etwas ausblendet, sondern dass es NUR das Abgeleitete
// ausblendet und nichts darüber hinaus.
//
// Erlass-Wahl BGBM (16 Artikel, ~21 KB Snapshot) = derselbe kleine Träger wie in
// `leser-optionen.e2e.ts`: die Toggle-Semantik ist seitengrössen-unabhängig (Attribut +
// CSS), und der 1686-Artikel-OR starvte den gedrosselten CI-Runner (Befund 4.7.2026).
//
// Die Fixtures sind am Bestand VERIFIZIERT (Sidecar public/normtext/struktur/bund/
// BGBM.json, Stand 26.7.2026):
//   · Art. 2  → trägt einen Historie-Shard-Eintrag ⇒ «Fassung»-Zeile «Gilt seit 01.01.2025»
//   · Art. 4  → fn 12 kl=A · fn 13 kl=V («SR 0.142.112.681») · fn 14 kl=A
//   · Art. 5  → fn 15 kl=Z («BBl 2017 2175») · fn 16 kl=V · fn 17 kl=A
//   · Art. 9  → fn 25/26/27/28, ALLE kl=A ⇒ Apparat ohne nicht-A-Zeile

async function warteReader(page: Page, url: string, artId: string): Promise<void> {
  await page.goto(url);
  // App-Ready: der «Ansicht»-Trigger rendert nur der Client (nicht im Crawler-HTML).
  await expect(page.getByRole('button', { name: 'Ansicht' }).first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator(`#${artId}`)).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
  // Die Fussnoten kommen aus dem lazy geladenen Struktur-Sidecar — erst wenn der
  // Apparat steht, sind die Klassen im DOM.
  await expect(page.locator('.lc-leser [data-fn-apparat]').first()).toBeAttached({ timeout: 20000 });
  await page.waitForTimeout(200);
}

// IDEMPOTENT (Befund beim ersten Lauf dieser Fassung): ein Klick auf einen
// Schalter schliesst das Panel NICHT. Ein zweiter blinder Klick auf «Ansicht»
// hätte es darum zugeklappt, und die folgende Zusicherung wäre am fehlenden Panel
// gescheitert — ein Fehlschlag der Prüfmechanik, nicht der Sache.
async function ansichtOeffnen(page: Page): Promise<void> {
  const panel = page.locator(ANSICHT_PANEL).first();
  if (!(await panel.isVisible())) {
    await page.getByRole('button', { name: 'Ansicht' }).first().click();
  }
  await expect(panel).toBeVisible();
}

/** Der EINE zweiwertige Schalter (S1) — kein Streifen mit drei Knöpfen mehr. */
function vermerkeSchalter(page: Page) {
  return page.getByRole(SCHALTER_ROLLE, { name: VERMERKE_SCHALTER_NAME });
}

/** Apparat-Zeile einer Fussnote dieses Artikels (id = fn-<artikel>-<nr>). */
function apparatZeile(page: Page, artikel: string, nr: string) {
  return page.locator(`#fn-${artikel}-${nr}`);
}

test('Grundzustand: «an» ist Default, Attribut am <html>, EIN zweiwertiger Schalter', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  // R6: der Default emittiert keine CSS-Regel — die Darstellung ist die heutige.
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  await ansichtOeffnen(page);
  const schalter = vermerkeSchalter(page);
  await expect(schalter).toBeVisible();
  await expect(schalter).toHaveAttribute('aria-checked', 'true');
  // S1: der dreiwertige Streifen ist WEG — und zwar restlos, samt seiner
  // Gruppen-Beschriftung und seiner drei `data-hist-wahl`-Knöpfe. Ohne diese
  // Negativ-Sonde könnte die alte Bedienung beim nächsten Merge zurückkommen,
  // ohne dass etwas rot wird (Präzedenz: der Wächter gegen die Alt-Zeitraum-Wahl
  // in `leser-kopf-v2.e2e.ts`).
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toHaveCount(0);
  await expect(page.locator('[data-hist-wahl]')).toHaveCount(0);
});

test('Ä68: «aus» blendet KEINE Fussnote aus — A, V und Z bleiben alle sichtbar', async ({ page }) => {
  // ── UMGEKEHRT gegenüber dem Stand bis 17.8.2026 (§6.3, David-Entscheid) ─────
  // Hier stand «aus blendet NUR Klasse A aus». Genau dieses «nur» war Davids
  // Befund: auf dem ZGB sind 719 von 809 Apparat-Einträgen `kl:'A'`, der Schalter
  // nahm also fast den ganzen amtlichen Apparat mit. Jetzt nimmt er keinen.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');

  const a12 = apparatZeile(page, '4', '12');       // A — Änderungsvermerk
  const v13 = apparatZeile(page, '4', '13');       // V — «SR 0.142.112.681»
  const a14 = apparatZeile(page, '4', '14');       // A — Änderungsvermerk
  const z15 = apparatZeile(page, '5', '15');       // Z — «BBl 2017 2175»
  const v16 = apparatZeile(page, '5', '16');       // V — «SR 0.632.231.422»

  // Vorbedingung: die Klassifikation ist im DOM angekommen (sonst prüfte der Test
  // nichts — ein Tor, das nicht scheitern kann, §6.7).
  await expect(a12).toHaveAttribute('data-fn-klasse', 'A');
  await expect(v13).toHaveAttribute('data-fn-klasse', 'V');
  await expect(z15).toHaveAttribute('data-fn-klasse', 'Z');

  // POSITIV im Grundzustand: alle sichtbar.
  for (const l of [a12, v13, a14, z15, v16]) {
    await l.scrollIntoViewIfNeeded();
    await expect(l).toBeVisible();
  }
  const verweisText = (await v13.textContent())?.trim() ?? '';
  expect(verweisText).toContain('0.142.112.681');

  await ansichtOeffnen(page);
  // CLS-Beobachter NUR für künftige Shifts (die Lade-Shifts sind nicht Gegenstand
  // des Umschalt-Beweises).
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await expect(vermerkeSchalter(page)).toHaveAttribute('aria-checked', 'false');

  // DER KERN VON Ä68: der amtliche Apparat bleibt VOLLSTÄNDIG stehen — auch A.
  await expect(a12, 'A-Eintrag verschwindet weiter mit den Änderungsvermerken (Davids Befund)').toBeVisible();
  await expect(a14).toBeVisible();
  await expect(v13).toBeVisible();
  await expect(z15).toBeVisible();
  await expect(v16).toBeVisible();
  // Und ihr Wortlaut ist wirklich lesbar, nicht bloss ein sichtbarer leerer Kasten.
  expect((await a12.textContent())?.trim() ?? '').toContain('Aufgehoben durch');

  // ZWEISEITIG: die A-Zeile IST abwählbar — über den Schalter, der sie trägt.
  // Ohne diese Gegenprobe könnte der Fix «alles immer sichtbar» bedeuten und die
  // Zusicherung oben wäre kein Tor mehr (§6.7).
  await ansichtOeffnen(page);
  await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(a12, 'A-Eintrag folgt dem Fussnoten-Schalter nicht').toBeHidden();
  await expect(v13, 'V-Eintrag folgt dem Fussnoten-Schalter nicht').toBeHidden();
  // R9/§8-DOM-Beweis: nicht gelöscht, nur weggeschaltet (Popover-Quelle,
  // Ctrl+F-Neutralität, vollständige Wiederherstellung).
  expect((await a12.textContent())?.trim() ?? '').toContain('Aufgehoben durch');
  expect(await a12.count()).toBe(1);
  await ansichtOeffnen(page);
  await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'an');
  await expect(a12).toBeVisible();

  // Und der NORMTEXT ist von keiner Regel erfasst — Ctrl+F-Beweis: der amtliche
  // Wortlaut des Artikels bleibt sichtbar und findbar.
  const artikel = page.locator('#art-4');
  await expect(artikel).toBeVisible();
  const sichtbarerText = await artikel.evaluate((el) => (el as HTMLElement).innerText);
  expect(sichtbarerText.length).toBeGreaterThan(20);
  expect(sichtbarerText).toContain('0.142.112.681');   // die V-Fussnote ist mit-sichtbar

  // POSITIV zurück auf «Vermerke an»: der Apparat war und bleibt vollständig.
  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  await expect(a12).toBeVisible();
  await expect(a14).toBeVisible();

  // A9-Muster: klick-getriebener Reflow ist input-exkludiert ⇒ kein CLS-Beitrag.
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBe(0);
});

test('Ä68: «aus» lässt die A-MARKER im Wortlaut stehen — sie hängen am Fussnoten-Schalter', async ({ page }) => {
  // ── UMGEKEHRT (§6.3) ────────────────────────────────────────────────────────
  // Hier stand «aus blendet auch die A-Marker aus». Die Marker-Ziffer im
  // Fliesstext ist der Zeiger auf amtlichen Fussnotentext; sie gehört zum
  // Apparat, nicht zur abgeleiteten Fassungs-Zeile. Gemessen nahm der
  // Vermerke-Schalter auf dem ZGB 636 von 809 Markern mit.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  const aMarker = page.locator('.lc-leser [data-fn-klasse="A"] [data-fn-ref]');
  const vMarker = page.locator('.lc-leser [data-fn-klasse="V"] [data-fn-ref]');
  const aAnzahl = await aMarker.count();
  const vAnzahl = await vMarker.count();
  expect(aAnzahl, 'BGBM trägt A-Marker im Wortlaut').toBeGreaterThan(0);
  expect(vAnzahl, 'BGBM trägt V-Marker im Wortlaut').toBeGreaterThan(0);

  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  // ALLE Marker bleiben — A wie V.
  for (let i = 0; i < aAnzahl; i++) {
    await expect(aMarker.nth(i), `A-Marker ${i} verschwindet mit den Änderungsvermerken`).toBeVisible();
  }
  await expect(vMarker.first()).toBeVisible();

  // ZWEISEITIG: der Fussnoten-Schalter nimmt sie sehr wohl — beide Klassen (§6.7).
  await ansichtOeffnen(page);
  await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  await expect(aMarker.first()).toBeHidden();
  await expect(vMarker.first()).toBeHidden();
  // DOM unverändert vollständig (A1-Mechanik).
  expect(await aMarker.count()).toBe(aAnzahl);
  expect(await vMarker.count()).toBe(vAnzahl);
});

test('Ä68 · 2×2-MATRIX: die beiden Schalter sind entkoppelt (Bund UND Kanton)', async ({ page }) => {
  // DIE Sonde, die es vor dem 17.8. nicht gab. Sie prüft alle vier Stellungen
  // gegen die eine Regel: der Fussnoten-Schalter trägt Marker + Apparat, der
  // Vermerke-Schalter die Fassungs-Zeile — und keiner den anderen.
  //
  // Zwei Erlasse, weil die KLASSEN sich unterscheiden: BGBM (Bund) trägt A/V/Z,
  // BS-640.100 (Kanton) trägt Fussnoten OHNE Klasse. Eine Regel, die nur bei
  // gesetzter Klasse richtig greift, fiele nur auf dem Kanton auf.
  for (const [pfad, artId, name] of [
    ['/gesetze/bund/BGBM', 'art-4', 'BGBM (Bund, mit Klassen)'],
    ['/gesetze/kanton/BS-640.100', 'art-1', 'BS-640.100 (Kanton, klassenlos)'],
  ] as const) {
    await warteReader(page, pfad, artId);

    const zaehle = () => page.evaluate(() => {
      const sicht = (e: Element) => (e as HTMLElement).checkVisibility();
      const n = (s: string) => [...document.querySelectorAll(s)].filter(sicht).length;
      return {
        apparat: n('.lc-leser [data-fn-apparat] > p'),
        marker: n('.lc-leser [data-fn-ref]'),
        fassung: n('.lc-leser [data-historie-zeile]'),
      };
    });

    // Grundzustand: alles an. POSITIV-Vorbedingung — ohne Apparat und Marker
    // prüfte die Matrix nichts (§6.7).
    const anAn = await zaehle();
    expect(anAn.apparat, `${name}: keine Apparat-Zeilen sichtbar`).toBeGreaterThan(0);
    expect(anAn.marker, `${name}: keine Marker sichtbar`).toBeGreaterThan(0);

    // Vermerke AUS ⇒ Apparat und Marker UNVERÄNDERT. Das ist Davids Befund.
    await ansichtOeffnen(page);
    const hatVermerke = (await vermerkeSchalter(page).count()) > 0;
    if (hatVermerke) {
      await vermerkeSchalter(page).click();
      await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
      const ausAn = await zaehle();
      expect(ausAn.apparat, `${name}: Vermerke=aus nimmt Apparat-Zeilen mit`).toBe(anAn.apparat);
      expect(ausAn.marker, `${name}: Vermerke=aus nimmt Marker mit`).toBe(anAn.marker);
      expect(ausAn.fassung, `${name}: Vermerke=aus lässt die Fassungs-Zeile stehen`).toBe(0);
    }

    // Fussnoten AUS ⇒ Apparat und Marker weg, in JEDER Vermerke-Stellung.
    await ansichtOeffnen(page);
    await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
    const ausAus = await zaehle();
    expect(ausAus.apparat, `${name}: Fussnoten=aus lässt Apparat-Zeilen stehen`).toBe(0);
    expect(ausAus.marker, `${name}: Fussnoten=aus lässt Marker stehen`).toBe(0);

    // Vermerke zurück auf «an» bei Fussnoten=aus: die Fassungs-Zeile kommt
    // wieder, der Apparat NICHT — der Beweis, dass die Flächen disjunkt sind.
    if (hatVermerke) {
      await ansichtOeffnen(page);
      await vermerkeSchalter(page).click();
      await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
      const anAus = await zaehle();
      expect(anAus.apparat, `${name}: Vermerke=an holt den Apparat gegen den Fussnoten-Schalter zurück`).toBe(0);
      expect(anAus.marker).toBe(0);
    }

    // Und zurück auf «alles an»: vollständige Wiederherstellung (A1).
    await ansichtOeffnen(page);
    await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'an');
    const zurueck = await zaehle();
    expect(zurueck.apparat, `${name}: Apparat nicht vollständig wiederhergestellt`).toBe(anAn.apparat);
    expect(zurueck.marker, `${name}: Marker nicht vollständig wiederhergestellt`).toBe(anAn.marker);
  }
});

test('Ä68-ZUSAGE: «aus» nimmt die Fassungs-Spur — und NUR sie; der DOM bleibt vollständig', async ({ page }) => {
  // ── DEKLARIERTE UMKEHR (§6.3) ────────────────────────────────────────────────
  // Bis 17.8. forderte dieser Test das GEMEINSAME Verschwinden von drei Trägern
  // (A-Marker · A-Apparat-Zeilen samt Rahmen · Fassungs-Zeile). Genau diese
  // Bündelung war Davids Befund: die ersten zwei sind amtlicher Fussnotentext und
  // gehören dem Fussnoten-Schalter. Geblieben ist EIN Träger — die abgeleitete
  // Fassungs-Zeile —, und der Test prüft jetzt beide Richtungen: sie geht, und
  // die anderen zwei BLEIBEN. Die A1-Mechanik gilt unverändert (David 5.7.2026:
  // `display:none`, nie gelöscht), damit «an» vollständig wiederherstellt.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');

  const art2 = page.locator('#art-2');
  await art2.scrollIntoViewIfNeeded();
  const fassung = art2.locator('[data-historie-zeile]');
  const slot = art2.locator('[data-hist-slot]');
  // Sichtbarkeits-Zählung der A-Marker. `checkVisibility()` und NICHT
  // `offsetParent`/`display` am Element selbst: geschaltet wird der VORFAHR, das
  // Knopf-Element trägt weiter `display: inline`. Und NICHT
  // `contentVisibilityAuto`: die Artikel stehen unter `content-visibility: auto` —
  // würde man vom Scrollen übersprungene Teilbäume als «unsichtbar» zählen, wäre
  // die Zusicherung schon durch die Scrollposition erfüllt und damit wertlos
  // (§6.7). Der Standard-Modus meldet genau das, was hier gemeint ist.
  const aMarkerSichtbar = () => page
    .locator('.lc-leser [data-fn-klasse="A"] [data-fn-ref]')
    .evaluateAll((els) => els.filter((el) => (el as HTMLElement).checkVisibility()).length);
  // Der Badge wächst mit dem idle-Shard-Resolve ein — POSITIV-Vorbedingung: ohne
  // ihn prüfte die Negativ-Zusicherung unten nichts (§6.7).
  await expect(fassung).toBeVisible({ timeout: 15000 });
  await expect(fassung.getByText('Fassung', { exact: true })).toBeVisible();
  const badgeText = (await fassung.textContent())?.trim() ?? '';
  expect(badgeText, 'Fassungs-Zeile ohne Text — die Sonde unten wäre wertlos').toContain('Gilt seit');

  // Art. 9 trägt AUSSCHLIESSLICH A-Fussnoten — der schärfste Fall der Umkehr:
  // bis 17.8. verschwand sein Apparat samt Rahmen, weil «nur A darin». Jetzt
  // bleibt er stehen, denn er ist vollständig amtlicher Fussnotentext.
  const apparat9 = page.locator('#art-9 [data-fn-apparat]');
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeVisible();
  // POSITIV-Vorbedingung auch für die Marker: es gibt überhaupt welche, und sie
  // sind sichtbar (sonst behauptete die Zusicherung unten nichts, §6.7).
  const markerVorher = await aMarkerSichtbar();
  expect(markerVorher, 'BGBM zeigt A-Marker im Grundzustand').toBeGreaterThan(0);

  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  // DER EINE TRÄGER: keine Fassungs-Spur mehr — weder die Zeile noch der
  // reservierte Slot. Der Slot MIT: seine reservierte Höhe (mt-4 +
  // min-h-beiwerk = 16+24 px) bliebe sonst als Phantom-Lücke unter jedem Artikel
  // stehen, und «aus» hätte doch eine Spur hinterlassen.
  await expect(fassung).toBeHidden();
  await expect(slot).toBeHidden();
  // UND NUR ER: der A-only-Apparat steht, die A-Marker stehen — unverändert viele.
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9, 'A-only-Apparat verschwindet weiter mit den Vermerken').toBeVisible();
  expect(await aMarkerSichtbar(), 'A-Marker verschwinden weiter mit den Vermerken')
    .toBe(markerVorher);

  // DOM-VOLLSTÄNDIGKEIT (§8): alles ist noch da, mit unverändertem Text.
  // `textContent`, NICHT `innerText`: die Artikel stehen unter
  // `content-visibility: auto` (W2.8) — dort liefert `innerText` für nicht
  // gerenderte Teilbäume einen LEEREN String, und die Zusicherung wäre still
  // wahr. `textContent` ist layout-unabhängig.
  await expect(fassung).toHaveCount(1);
  expect((await fassung.textContent())?.trim() ?? '').toBe(badgeText);
  await expect(apparat9).toHaveCount(1);
  expect((await apparat9.textContent())?.trim() ?? '').toContain('Eingefügt durch');

  // Und der NORMTEXT des Artikels ist unberührt — sichtbar und findbar. Hier
  // ebenfalls `textContent` statt `innerText`: Art. 2 liegt weit unten, sein
  // Teilbaum ist vom `content-visibility: auto` übersprungen, und `innerText`
  // lieferte dafür einen LEEREN String (genau so beim ersten Lauf dieser Fassung
  // passiert — die Zeile wäre still falsch geworden). Die SICHTBARKEIT prüft die
  // Locator-Zusicherung, die eine Bounding-Box auswertet und vom Übersprungenen
  // nicht getäuscht wird.
  await art2.scrollIntoViewIfNeeded();
  await expect(art2).toBeVisible();
  expect(((await art2.textContent()) ?? '').length).toBeGreaterThan(20);

  // POSITIV zurück: «an» stellt die Fassungs-Spur vollständig wieder her.
  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeVisible();
  await expect(slot).toBeVisible();
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeVisible();
  expect(await aMarkerSichtbar(), 'A-Marker nach «an» nicht wiederhergestellt').toBe(markerVorher);
});

test('Persistenz + Pre-Paint: die Wahl übersteht den Reload ohne Flackern', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  // S1: der Wert steht unter dem NEUEN Schlüssel (das dreiwertige `hist` ist weg).
  expect(ls).toContain('"histansicht":"aus"');
  expect(ls, 'Alt-Schlüssel `hist` weiter geschrieben — die Migration griffe bei jedem Laden neu').not.toContain('"hist":');
  expect(ls, 'gestrichener Schalter `verweise` weiter geschrieben').not.toContain('"verweise"');

  await page.reload();
  // Pre-Paint (wendeLeserOptionenAn in main.tsx, CSP-konform aus dem Modul-Script):
  // das Attribut steht VOR dem ersten Paint — kein Flash der Fassungs-Zeile.
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await expect(page.locator('#art-4')).toBeVisible();
  // Ä68: der Apparat ist von dieser Stellung nicht betroffen — beide Klassen
  // stehen (bis 17.8. stand hier `toBeHidden()` für die A-Zeile).
  await expect(apparatZeile(page, '4', '12')).toBeVisible();
  await expect(apparatZeile(page, '4', '13')).toBeVisible();
  // Was die Stellung WIRKLICH bewirkt, überlebt den Reload ebenfalls.
  await expect(page.locator('.lc-leser [data-hist-slot]').first()).toBeHidden();
});

test('S1-MIGRATION im Browser: ein gespeichertes «chronologie» steht als «an» da', async ({ page }) => {
  // Der Bestands-Speicher eines Nutzers von VOR S1 — genau der Fall, der sich
  // später nicht mehr nachstellen lässt. Die Regeln selbst liegen DOM-frei unter
  // `src/tests/leser-optionen-migration.test.ts`; hier zählt, dass der Pre-Paint-
  // Pfad (main.tsx → wendeLeserOptionenAn) sie wirklich anwendet und der Schalter
  // danach richtig steht. «chronologie» hiess «Vermerke sichtbar» ⇒ «an», nie
  // «aus» (§8: dem Nutzer nicht wegnehmen, was er ausdrücklich bestellt hat).
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        fussnoten: 'an', verweise: 'aus', leitfaelle: 'an', hist: 'chronologie',
      }));
    } catch { /* privater Modus */ }
  });
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'an');
  // Der gestrichene Schalter kann nichts mehr bewirken: kein Attribut am <html>.
  await expect(page.locator('html')).not.toHaveAttribute('data-verweise', /.*/);
  await ansichtOeffnen(page);
  await expect(vermerkeSchalter(page)).toHaveAttribute('aria-checked', 'true');
  // Und die Vermerke sind wirklich da (nicht bloss der Schalter richtig gestellt).
  await expect(apparatZeile(page, '4', '12')).toBeVisible();
});

test('Ä68: KEINE Klasse folgt dem Vermerke-Schalter — A, G und U auf einem Artikel', async ({ page }) => {
  // Gegenprüfungs-Befund B5 (26.7.2026) in seiner Ä68-Fassung. Die Sonde ist
  // dieselbe, ihre Richtung ist gedreht: bis 17.8. bewachte sie, dass der
  // CSS-Selektor nicht von `[data-fn-klasse="A"]` auf `[data-fn-klasse]`
  // verbreitert wird. Jetzt bewacht sie, dass er nicht ZURÜCKKOMMT — würde
  // irgendeine `[data-fn-klasse…]`-Regel wieder an `data-histansicht` gehängt,
  // wird genau hier rot.
  //
  // ELG Art. 10 trägt A, G UND U auf EINEM Artikel (verifiziert am Sidecar
  // 26.7.2026): fn34 = A · fn35 = U («Beträge angepasst gemäss …») · fn41 = G
  // (Revisionsvermerk mit UeB-Zeiger «Siehe auch die UeB …»).
  await warteReader(page, '/gesetze/bund/ELG', 'art-10');
  const a34 = apparatZeile(page, '10', '34');
  const u35 = apparatZeile(page, '10', '35');
  const g41 = apparatZeile(page, '10', '41');

  // Vorbedingung: die Klassen stehen wirklich im DOM (sonst prüft der Test nichts, §6.7).
  await expect(a34).toHaveAttribute('data-fn-klasse', 'A');
  await expect(u35).toHaveAttribute('data-fn-klasse', 'U');
  await expect(g41).toHaveAttribute('data-fn-klasse', 'G');

  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');

  await expect(a34, 'A folgt weiter dem Vermerke-Schalter').toBeVisible();
  await expect(u35).toBeVisible();
  await expect(g41).toBeVisible();
  // Und ihr Inhalt ist unverändert lesbar (nicht bloss ein leeres sichtbares Element).
  await expect(a34).toContainText('Fassung gemäss');
  await expect(u35).toContainText('Beträge angepasst');
  await expect(g41).toContainText('Siehe auch die UeB');

  // ZWEISEITIG: alle drei folgen dem FUSSNOTEN-Schalter (§6.7 — sonst wäre die
  // Zusicherung oben mit «nichts ist je ausblendbar» erfüllbar).
  await ansichtOeffnen(page);
  await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');
  for (const l of [a34, u35, g41]) await expect(l).toBeHidden();
});

test('Der Schalter bleibt bei «Fussnoten aus» stehen — weil er dort weiter wirkt', async ({ page }) => {
  // ── DEKLARIERTE UMKEHR (§6.3) ────────────────────────────────────────────
  // Bis S1 stand hier das Gegenteil: die Historie-Wahl wurde bei «Fussnoten aus»
  // ENTFERNT, weil sie nur den Fussnoten-Apparat betraf und dort wirkungslos war
  // (§13 F4, kein totes Steuerelement). Seit S1 hängt an demselben Schalter auch
  // die «Fassung»-Zeile, und die folgt `data-fussnoten` NICHT — sie kommt aus dem
  // Historie-Shard, nicht aus dem Apparat. Der Schalter ist bei «Fussnoten aus»
  // also nachweislich WIRKSAM, und ihn wegzunehmen wäre derselbe F4-Fehler,
  // nur spiegelbildlich: eine wirksame Bedienung, die man nicht erreichen kann.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  const art2 = page.locator('#art-2');
  await art2.scrollIntoViewIfNeeded();
  const fassung = art2.locator('[data-historie-zeile]');
  await expect(fassung).toBeVisible({ timeout: 15000 });

  await ansichtOeffnen(page);
  await page.getByRole(SCHALTER_ROLLE, { name: 'Fussnoten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-fussnoten', 'aus');

  // POSITIV — der Beweis der Wirksamkeit: bei «Fussnoten aus» steht die
  // Fassungs-Zeile weiter da (sie ist kein Fussnoten-Apparat) …
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeVisible();
  // … der Schalter ist erreichbar …
  await ansichtOeffnen(page);
  await expect(vermerkeSchalter(page)).toBeVisible();
  // … und er nimmt sie weg. Genau das konnte man vor S1 nicht.
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeHidden();
});

test('axe: das offene Panel mit dem zweiwertigen Schalter ist sauber', async ({ page }, testInfo) => {
  // Das Steuerelement lebt in einem Panel, das die a11y.e2e.ts-Stichprobe NICHT
  // öffnet (die scannt den Reader mit geschlossenem Menü) — ohne diesen Scan wäre
  // die axe-Zusage für diesen Schritt leer. Gescannt wird BEIDES: das offene
  // Panel und die Seite in der Stellung «aus» (dort verschwinden Elemente, und
  // ein verwaistes `aria-controls` oder ein leerer Rahmen fiele hier auf).
  const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  // Gleiche Determinismus-Vorkehrungen wie a11y.e2e.ts: Theme gepinnt (sonst
  // entscheidet die Uhrzeit über hell/dunkel → flaky Kontraste) und reduzierte
  // Bewegung (sonst misst axe mitten in der Einblende-Animation).
  await page.addInitScript(() => {
    try { localStorage.setItem('lexmetrik-thema', 'hell'); } catch { /* privater Modus */ }
  });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await warteReader(page, '/gesetze/bund/BGBM', 'art-9');
  await ansichtOeffnen(page);
  await vermerkeSchalter(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-histansicht', 'aus');
  await ansichtOeffnen(page);
  await expect(vermerkeSchalter(page)).toBeVisible();

  const ergebnis = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  // Gleiche Tor-Politik wie a11y.e2e.ts: critical/serious gaten. `link-in-text-block`
  // ist der dokumentierte Marken-Entscheid B-2 (Inline-Links ohne Unterstreichung)
  // und gilt für die ganze Reader-Seite, nicht für diese Fläche.
  const bekannt = new Set(['link-in-text-block']);
  const schwer = ergebnis.violations.filter(
    (v) => (v.impact === 'critical' || v.impact === 'serious') && !bekannt.has(v.id),
  );
  if (ergebnis.violations.length > 0) {
    await testInfo.attach('hist-ansicht-befunde.json', {
      body: JSON.stringify(ergebnis.violations.map((v) => ({
        id: v.id, impact: v.impact, help: v.help, knoten: v.nodes.map((n) => n.target.join(' ')),
      })), null, 2),
      contentType: 'application/json',
    });
  }
  expect(
    schwer.map((v) => `${v.id} (${v.impact}): ${v.help} — z. B. ${v.nodes[0]?.target.join(' ')}`),
    'axe hist-ansicht: keine critical/serious-Verstösse',
  ).toEqual([]);
});
