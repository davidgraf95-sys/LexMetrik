// @shard-gruppe: 4
import { test, expect, type Page } from '@playwright/test';
import { F_MARKE, fassungAufklappen, fassungsMarke } from './helpers/fassungsRubrik';
import AxeBuilder from '@axe-core/playwright';
import {
  ANSICHT_PANEL, AUS_WAHL_NAME, FUSSNOTEN_WAHL_NAME, VERMERKE_SCHALTER_NAME, WAHL_ROLLE,
} from './helpers/leserBeschriftung';

// ÄNDERUNGSVERMERKE — zweiwertig seit S1, ENTKOPPELT seit Ä68 (Entscheid David
// 17.8.2026), EINE DREIER-WAHL seit D35-F3 (Entscheid David 7.9.2026).
//
// ── STUFE 1 (§6.3), 17.8.2026 · Ä68 ─────────────────────────────────────────
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
// Die Zahlen bleiben stehen, was auch immer später gemessen wird (§0 Ziff. 2b).
//
// ── STUFE 2 (§6.3), 7.9.2026 · D35-F3 ───────────────────────────────────────
// DAVIDS BEFUND, wörtlich: «es soll entweder fassung oder fussnoten angezeigt
// werden. also entweder fassung, fussnoten oder aus.» Gemessen (D35-Bericht
// Teil 3, ZPO @1440) waren alle VIER Kombinationen der zwei Schalter erreichbar.
// Sein Entscheid dazu: «A und verlustfrei».
//
// DIE NEUE, EINE WAHRHEIT — ein Attribut, drei Stellungen:
//   fassung    Fassungs-Zeile («Gilt seit …» + Zeitleiste) DA · `kl:'A'` gedämpft
//   fussnoten  voller amtlicher Apparat inkl. `kl:'A'` · Fassungs-Zeile aus
//   aus        weder noch
// In JEDER Stellung sichtbar: `kl:'V'/'G'/'Z'/'U'` und jede Fussnote OHNE Klasse.
//
// WAS DAS FÜR DIESE DATEI HEISST: die Ä68-Zusicherung «der Vermerke-Schalter
// fasst den Apparat gar nicht an» ist durch eine ENGERE ersetzt — «die Wahl
// fasst ausschliesslich `kl:'A'` an». Der Vertrag ist damit nicht schwächer:
// jede Zusicherung bleibt ZWEISEITIG (A verschwindet in «fassung»/«aus» UND
// steht in «fussnoten»), und die Drei-Stellungs-Matrix unten prüft alle
// Stellungen gegen alle Klassen zugleich.
//
// ── DIE NICHT VERHANDELBARE AUFLAGE ─────────────────────────────────────────
// H0-Auflage 1 (Vollbericht `bibliothek/normen/hist-ansicht-h0-trennbarkeit.md`,
// Nachtrag 17.8.2026): `A` ist die EINZIGE Klasse, welche die Änderungs-Ansicht
// dämpfen darf — echte Verweise (V), Grauzone (G), Publikationsnachweise (Z),
// Unklares (U) und alles OHNE Klasse bleiben unberührt. Genau das ist seit
// D35-F3 die Verlustfreiheit, und geprüft wird darum nicht nur, DASS eine
// Stellung etwas dämpft, sondern dass sie NUR `A` dämpft.
//
// Erlass-Wahl BGBM (16 Artikel, ~21 KB Snapshot) = derselbe kleine Träger wie in
// `leser-optionen.e2e.ts`: die Semantik ist seitengrössen-unabhängig (Attribut +
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

// IDEMPOTENT (Befund beim ersten Lauf der S1-Fassung): ein Klick auf eine
// Stellung schliesst das Panel NICHT. Ein zweiter blinder Klick auf «Ansicht»
// hätte es darum zugeklappt, und die folgende Zusicherung wäre am fehlenden Panel
// gescheitert — ein Fehlschlag der Prüfmechanik, nicht der Sache.
async function ansichtOeffnen(page: Page): Promise<void> {
  const panel = page.locator(ANSICHT_PANEL).first();
  if (!(await panel.isVisible())) {
    await page.getByRole('button', { name: 'Ansicht' }).first().click();
  }
  await expect(panel).toBeVisible();
}

/** Die drei Stellungen der EINEN Wahl (D35-F3). */
const STELLUNG = {
  fassung: VERMERKE_SCHALTER_NAME,
  fussnoten: FUSSNOTEN_WAHL_NAME,
  aus: AUS_WAHL_NAME,
} as const;

/** Stellung wählen und warten, bis das Attribut am <html> steht. */
async function waehle(page: Page, wert: keyof typeof STELLUNG): Promise<void> {
  await ansichtOeffnen(page);
  await page.getByRole(WAHL_ROLLE, { name: STELLUNG[wert] }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vermerke', wert);
}

/** Apparat-Zeile einer Fussnote dieses Artikels (id = fn-<artikel>-<nr>). */
function apparatZeile(page: Page, artikel: string, nr: string) {
  return page.locator(`#fn-${artikel}-${nr}`);
}

test('Grundzustand: «Fassung» ist Vorgabe, Attribut am <html>, DREI Stellungen', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await expect(page.locator('html')).toHaveAttribute('data-vermerke', 'fassung');
  await ansichtOeffnen(page);
  const wahl = page.locator(ANSICHT_PANEL).getByRole(WAHL_ROLLE);
  await expect(wahl, 'die Wahl hat genau drei Stellungen').toHaveCount(3);
  // GENAU EINE steht — das ist die Zusage einer Radiogruppe, und sie ist der
  // Kern von Davids Befund («entweder … oder»). Eine Checkbox-Gruppe wäre hier
  // grün mit zwei Haken; diese Zeile ist der Unterschied.
  const gesetzt = await wahl.evaluateAll(
    (els) => els.filter((e) => e.getAttribute('aria-checked') === 'true').length,
  );
  expect(gesetzt, 'genau eine Stellung ist gesetzt').toBe(1);
  await expect(page.getByRole(WAHL_ROLLE, { name: VERMERKE_SCHALTER_NAME }))
    .toHaveAttribute('aria-checked', 'true');
  // Die zwei alten `menuitemcheckbox`-Schalter für dieselbe Frage sind WEG.
  // Ohne diese Negativ-Sonde könnte die Zweier-Bedienung beim nächsten Merge
  // zurückkommen, ohne dass etwas rot wird (Präzedenz: der Wächter gegen die
  // Alt-Zeitraum-Wahl in `leser-kopf-v2.e2e.ts`).
  await expect(page.locator(`${ANSICHT_PANEL} [role="menuitemcheckbox"][aria-label^="Fussnoten"]`))
    .toHaveCount(0);
  // S1: der dreiwertige Streifen von vor 17.8.2026 ist ebenfalls restlos weg.
  await expect(page.locator('[aria-label="Darstellung der Änderungshistorie"]')).toHaveCount(0);
  await expect(page.locator('[data-hist-wahl]')).toHaveCount(0);
});

test('VERLUSTFREI: keine Stellung blendet V oder Z aus — nur A wechselt', async ({ page }) => {
  // ── DEKLARIERTE ÄNDERUNG (§6.3, Entscheid David 7.9.2026) ──────────────────
  // Bis 7.9. prüfte dieser Fall, dass der VERMERKE-Schalter gar keine Fussnote
  // anfasst und der FUSSNOTEN-Schalter alle. Den zweiten gibt es nicht mehr:
  // amtlicher Nicht-Änderungs-Apparat wird nie versteckt. Geprüft wird jetzt die
  // engere Zusage — `A` wechselt mit der Stellung, V und Z nie.
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

  // Stellung «Fussnoten»: alles sichtbar — der volle amtliche Apparat.
  await waehle(page, 'fussnoten');
  for (const l of [a12, v13, a14, z15, v16]) {
    await l.scrollIntoViewIfNeeded();
    await expect(l).toBeVisible();
  }
  expect((await v13.textContent())?.trim() ?? '').toContain('0.142.112.681');

  // ── DER CLS-BEWEIS STEHT NICHT HIER (§5/§6.7, Befund beim Voll-Lauf 7.9.2026)
  // Er stand bis hierher mitten in dieser Schleife und mass 0.000153 statt 0 —
  // NICHT vom Umschalten: die Schleife scrollt zwischen den Stellungen, und der
  // idle nachgeladene Historie-Shard wächst dabei ein. Ein Beobachter, der über
  // drei Umschaltungen samt Scroll-Fahrten läuft, misst Nachlade-Shifts mit und
  // sagt darum über den Klick nichts aus. Der enge, aussagekräftige Fall — ein
  // Beobachter, EIN Umschaltvorgang, kein Scroll dazwischen — steht in
  // `e2e/leser-optionen.e2e.ts` («A1-Mechanik … kein CLS»). Zwei Kopien
  // derselben Zusage sind ohnehin eine zu viel.

  for (const stellung of ['fassung', 'aus'] as const) {
    await waehle(page, stellung);
    // DER KERN DER VERLUSTFREIHEIT: V und Z stehen in JEDER Stellung.
    await expect(v13, `${stellung}: V-Eintrag verschwindet`).toBeVisible();
    await expect(z15, `${stellung}: Z-Eintrag verschwindet`).toBeVisible();
    await expect(v16, `${stellung}: V-Eintrag verschwindet`).toBeVisible();
    // ZWEISEITIG: A ist sehr wohl gedämpft. Ohne diese Gegenprobe wäre die
    // Zusage oben mit «nichts ist je ausblendbar» erfüllbar (§6.7).
    await expect(a12, `${stellung}: A-Eintrag steht weiter da`).toBeHidden();
    await expect(a14, `${stellung}: A-Eintrag steht weiter da`).toBeHidden();
    // R9/§8-DOM-Beweis: nicht gelöscht, nur weggeschaltet (Popover-Quelle,
    // Ctrl+F-Neutralität, vollständige Wiederherstellung).
    expect((await a12.textContent())?.trim() ?? '').toContain('Aufgehoben durch');
    expect(await a12.count()).toBe(1);
  }

  // Und der NORMTEXT ist von keiner Regel erfasst — Ctrl+F-Beweis: der amtliche
  // Wortlaut des Artikels bleibt sichtbar und findbar, samt V-Fussnote.
  const artikel = page.locator('#art-4');
  await expect(artikel).toBeVisible();
  const sichtbarerText = await artikel.evaluate((el) => (el as HTMLElement).innerText);
  expect(sichtbarerText.length).toBeGreaterThan(20);
  expect(sichtbarerText).toContain('0.142.112.681');

  // POSITIV zurück: «Fussnoten» stellt den Apparat vollständig wieder her.
  await waehle(page, 'fussnoten');
  await expect(a12).toBeVisible();
  await expect(a14).toBeVisible();
});

test('Die A-MARKER im Wortlaut folgen der Wahl, die V-Marker nie', async ({ page }) => {
  // ── DEKLARIERTE ÄNDERUNG (§6.3) ───────────────────────────────────────────
  // Bis 7.9. hingen ALLE Marker am Fussnoten-Schalter und keiner am
  // Vermerke-Schalter. Jetzt hängt genau die A-Marke an der Wahl — sie ist der
  // Zeiger auf die Änderungshistorie, und ihn stehen zu lassen, während der
  // Eintrag gedämpft ist, wäre ein Zeiger ins Nichts (§8).
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  const aMarker = page.locator('.lc-leser [data-fn-klasse="A"] [data-fn-ref]');
  const vMarker = page.locator('.lc-leser [data-fn-klasse="V"] [data-fn-ref]');
  const aAnzahl = await aMarker.count();
  const vAnzahl = await vMarker.count();
  expect(aAnzahl, 'BGBM trägt A-Marker im Wortlaut').toBeGreaterThan(0);
  expect(vAnzahl, 'BGBM trägt V-Marker im Wortlaut').toBeGreaterThan(0);

  await waehle(page, 'fussnoten');
  for (let i = 0; i < aAnzahl; i++) {
    await expect(aMarker.nth(i), `A-Marker ${i} fehlt in der Stellung «Fussnoten»`).toBeVisible();
  }
  await expect(vMarker.first()).toBeVisible();

  await waehle(page, 'fassung');
  await expect(aMarker.first(), '«Fassung» lässt die A-Marke stehen').toBeHidden();
  await expect(vMarker.first(), '«Fassung» nimmt die V-Marke mit').toBeVisible();
  // DOM unverändert vollständig (A1-Mechanik).
  expect(await aMarker.count()).toBe(aAnzahl);
  expect(await vMarker.count()).toBe(vAnzahl);
});

test('DREI-STELLUNGS-MATRIX: Bund mit Klassen · Kanton ohne Klassifikation', async ({ page }) => {
  // DIE Sonde der Verlustfreiheit. Sie prüft jede Stellung gegen die eine Regel:
  // die Wahl trägt `kl:'A'` und die Fassungs-Zeile — und sonst nichts.
  //
  // Zwei Erlasse, weil die KLASSEN sich unterscheiden: BGBM (Bund) trägt A/V/Z,
  // BS-640.100 (Kanton) trägt Fussnoten OHNE Klasse. Eine Regel, die nur bei
  // gesetzter Klasse richtig greift, fiele nur auf dem Kanton auf.
  //
  // KANTON, §8: dort gibt es weder `kl` (`lib/normtext/browse.ts`) noch einen
  // Historie-Shard (gemessen 7.9.2026: 0 von 209 Shards sind kantonal) — die
  // Wahl wird darum gar nicht erst angeboten (D1), und der Apparat steht
  // vollständig. Drei Stellungen mit identischer Wirkung anzubieten wäre genau
  // das tote Steuerelement, das D1 abgeschafft hat.
  for (const [pfad, artId, name, mitWahl] of [
    ['/gesetze/bund/BGBM', 'art-4', 'BGBM (Bund, mit Klassen)', true],
    ['/gesetze/kanton/BS-640.100', 'art-1', 'BS-640.100 (Kanton, klassenlos)', false],
  ] as const) {
    await warteReader(page, pfad, artId);

    const zaehle = () => page.evaluate(() => {
      const sicht = (e: Element) => (e as HTMLElement).checkVisibility();
      const n = (s: string) => [...document.querySelectorAll(s)].filter(sicht).length;
      return {
        apparat: n('.lc-leser [data-fn-apparat] > p'),
        nichtA: n('.lc-leser [data-fn-apparat] > p:not([data-fn-klasse="A"])'),
        marker: n('.lc-leser [data-fn-ref]'),
        // §6.3-DEKLARATION (D40, 7.9.2026): die Fassungs-SPUR im Lesetext ist
        // seit D40 die Rubrik-Marke der Funktionszeile, nicht mehr der
        // Kopf-Slot. `[data-historie-zeile]` taugt als Sichtbarkeits-Zähler
        // nicht mehr — sie steht jetzt auch in der Druck-Projektion
        // (`hidden print:block`), die am Bildschirm nie sichtbar ist.
        fassung: n('.lc-leser .lr7-bez-marke[data-reg="f"]'),
      };
    });

    await ansichtOeffnen(page);
    const wahlDa = (await page.locator(ANSICHT_PANEL).getByRole(WAHL_ROLLE).count()) > 0;
    expect(wahlDa, `${name}: Wahl angeboten?`).toBe(mitWahl);

    if (!mitWahl) {
      // Ohne Wahl kann nichts gedämpft sein — der Apparat steht vollständig.
      const alles = await zaehle();
      expect(alles.apparat, `${name}: keine Apparat-Zeilen sichtbar`).toBeGreaterThan(0);
      expect(alles.nichtA, `${name}: klassenlose Zeilen sind alle nicht-A`).toBe(alles.apparat);
      expect(alles.marker, `${name}: keine Marker sichtbar`).toBeGreaterThan(0);
      continue;
    }

    // Stellung «Fussnoten» = der volle Apparat. POSITIV-Vorbedingung: ohne
    // Apparat und Marker prüfte die Matrix nichts (§6.7).
    await waehle(page, 'fussnoten');
    const voll = await zaehle();
    expect(voll.apparat, `${name}: keine Apparat-Zeilen sichtbar`).toBeGreaterThan(0);
    expect(voll.marker, `${name}: keine Marker sichtbar`).toBeGreaterThan(0);
    expect(voll.apparat - voll.nichtA, `${name}: keine A-Zeilen — die Matrix prüfte nichts`)
      .toBeGreaterThan(0);
    expect(voll.fassung, `${name}: «Fussnoten» lässt die Fassungs-Zeile stehen`).toBe(0);

    for (const stellung of ['fassung', 'aus'] as const) {
      await waehle(page, stellung);
      const m = await zaehle();
      // A ist weg …
      expect(m.apparat, `${name}/${stellung}: A-Zeilen stehen weiter da`).toBe(voll.nichtA);
      // … und JEDE nicht-A-Zeile steht: das ist die Verlustfreiheit als Zahl.
      expect(m.nichtA, `${name}/${stellung}: eine nicht-A-Zeile ist mit verschwunden`)
        .toBe(voll.nichtA);
      expect(m.marker, `${name}/${stellung}: Marker-Zahl stimmt nicht`).toBeLessThan(voll.marker);
      expect(m.fassung, `${name}/${stellung}: Fassungs-Zeile`)
        .toBe(stellung === 'fassung' ? voll.fassung || m.fassung : 0);
    }

    // Zurück auf «Fussnoten»: vollständige Wiederherstellung (A1).
    await waehle(page, 'fussnoten');
    const zurueck = await zaehle();
    expect(zurueck.apparat, `${name}: Apparat nicht vollständig wiederhergestellt`).toBe(voll.apparat);
    expect(zurueck.marker, `${name}: Marker nicht vollständig wiederhergestellt`).toBe(voll.marker);
  }
});

test('«Fassung» zeigt die Fassungs-Spur, «Fussnoten» und «aus» nehmen sie — der DOM bleibt vollständig', async ({ page }) => {
  // ── DEKLARIERTE ÄNDERUNG (§6.3) ───────────────────────────────────────────
  // Bis 17.8. forderte dieser Test das GEMEINSAME Verschwinden von drei Trägern
  // (A-Marker · A-Apparat-Zeilen samt Rahmen · Fassungs-Zeile), bis 7.9. das
  // Verschwinden NUR der Fassungs-Zeile. Seit D35-F3 gilt: die Fassungs-Zeile und
  // die A-Träger sind GEGENLÄUFIG — genau eines von beiden steht (Davids
  // «entweder … oder»), und in der Stellung «aus» keines.
  // Die A1-Mechanik gilt unverändert (David 5.7.2026: `display:none`, nie
  // gelöscht), damit jede Stellung vollständig wiederherstellt.
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');

  const art2 = page.locator('#art-2');
  await art2.scrollIntoViewIfNeeded();
  // §6.3-DEKLARATION (D40, 7.9.2026): die Fassungs-Spur ist die Rubrik der
  // Funktionszeile — Marke UND Block. Beide werden geprüft, weil beide fallen
  // müssen: ein Griff ohne Block wäre die Zusage einer Liste, die nicht kommt.
  const fassung = art2.locator(F_MARKE);
  const slot = art2.locator('.lr7-bez-block[data-reg="f"]');
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
  const zeile = await fassungAufklappen(art2);
  await expect(zeile.getByText('Fassung', { exact: true })).toBeVisible();
  const badgeText = (await zeile.textContent())?.trim() ?? '';
  expect(badgeText, 'Fassungs-Zeile ohne Text — die Sonde unten wäre wertlos').toContain('Gilt seit');
  // Die Marke selbst nennt die Zahl der Fassungen (§8: gezählt, nie geschätzt).
  const markeText = (await fassung.textContent())?.trim() ?? '';
  expect(markeText, 'die Marke nennt keine Fassungs-Zahl').toMatch(/\d+\s*Fassung/);

  // Art. 9 trägt AUSSCHLIESSLICH A-Fussnoten — der schärfste Fall: sein Apparat
  // hat in «Fassung»/«aus» keine einzige Zeile mehr zu zeigen und verschwindet
  // darum samt Rahmen (`data-fn-nur-a`, in React entschieden statt per `:has()`).
  const apparat9 = page.locator('#art-9 [data-fn-apparat]');
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toHaveAttribute('data-fn-nur-a', '');

  await waehle(page, 'fussnoten');
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9, '«Fussnoten» zeigt den A-only-Apparat').toBeVisible();
  const markerVorher = await aMarkerSichtbar();
  expect(markerVorher, '«Fussnoten» zeigt A-Marker').toBeGreaterThan(0);
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung, '«Fussnoten» lässt die Fassungs-Marke stehen').toBeHidden();
  await expect(slot, '«Fussnoten» lässt den Fassungs-Block stehen').toBeHidden();

  await waehle(page, 'fassung');
  // Die Fassungs-Spur ist da …
  await art2.scrollIntoViewIfNeeded();
  await expect(fassung).toBeVisible();
  await expect(slot).toBeVisible();
  // … und die A-Spur ist weg, samt dem leer gewordenen Rahmen. Ohne die
  // Rahmen-Zusicherung bliebe eine nackte Haarlinie über nichts stehen.
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9, 'A-only-Apparat steht als leerer Kasten da').toBeHidden();
  expect(await aMarkerSichtbar(), 'A-Marker stehen in «Fassung» weiter da').toBe(0);

  await waehle(page, 'aus');
  await art2.scrollIntoViewIfNeeded();
  // DER EINE TRÄGER: keine Fassungs-Spur mehr — weder die Marke noch ihr Block.
  //
  // §0 Ziff. 2b: der Satz, der hier stand, galt dem reservierten Kopf-Slot
  // («seine reservierte Höhe mt-4 + min-h-beiwerk = 16+24 px bliebe sonst als
  // Phantom-Lücke unter jedem Artikel stehen») und war für seinen Stand richtig.
  // Mit D40 ist der Slot gefallen; die Zusage «keine Spur» gilt unverändert und
  // trifft jetzt beide Träger der Rubrik.
  await expect(fassung).toBeHidden();
  await expect(slot).toBeHidden();
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeHidden();

  // DOM-VOLLSTÄNDIGKEIT (§8): alles ist noch da, mit unverändertem Text.
  // D40: geprüft wird an der DRUCK-Projektion — sie ist die Stelle, an der die
  // Zeile in JEDER Stellung im DOM steht (die Rubrik rendert ihren Block erst
  // auf Klick, s. D35-F1). Genau daran hängt auch die Zusage «der Ausdruck
  // verliert den Fassungsstand nicht».
  const imDruck = art2.locator('[data-hist-druck] [data-historie-zeile]');
  // `textContent`, NICHT `innerText`: die Artikel stehen unter
  // `content-visibility: auto` (W2.8) — dort liefert `innerText` für nicht
  // gerenderte Teilbäume einen LEEREN String, und die Zusicherung wäre still
  // wahr. `textContent` ist layout-unabhängig.
  await expect(imDruck).toHaveCount(1);
  expect((await imDruck.textContent())?.trim() ?? '').toContain('Gilt seit');
  await expect(apparat9).toHaveCount(1);
  expect((await apparat9.textContent())?.trim() ?? '').toContain('Eingefügt durch');

  // Und der NORMTEXT des Artikels ist unberührt — sichtbar und findbar. Hier
  // ebenfalls `textContent` statt `innerText`: Art. 2 liegt weit unten, sein
  // Teilbaum ist vom `content-visibility: auto` übersprungen, und `innerText`
  // lieferte dafür einen LEEREN String (genau so beim ersten Lauf der S1-Fassung
  // passiert — die Zeile wäre still falsch geworden). Die SICHTBARKEIT prüft die
  // Locator-Zusicherung, die eine Bounding-Box auswertet und vom Übersprungenen
  // nicht getäuscht wird.
  await art2.scrollIntoViewIfNeeded();
  await expect(art2).toBeVisible();
  expect(((await art2.textContent()) ?? '').length).toBeGreaterThan(20);

  // POSITIV zurück: «Fussnoten» stellt die A-Spur vollständig wieder her.
  await waehle(page, 'fussnoten');
  await page.locator('#art-9').scrollIntoViewIfNeeded();
  await expect(apparat9).toBeVisible();
  expect(await aMarkerSichtbar(), 'A-Marker nicht wiederhergestellt').toBe(markerVorher);
});

test('Persistenz + Pre-Paint: die Wahl übersteht den Reload ohne Flackern', async ({ page }) => {
  await warteReader(page, '/gesetze/bund/BGBM', 'art-4');
  await waehle(page, 'aus');
  const ls = await page.evaluate(() => localStorage.getItem('lm.leser.optionen'));
  // D35-F3: der Wert steht unter dem EINEN neuen Schlüssel.
  expect(ls).toContain('"vermerke":"aus"');
  expect(ls, 'Alt-Schlüssel `hist` weiter geschrieben — die Migration griffe bei jedem Laden neu').not.toContain('"hist":');
  expect(ls, 'gestrichener Schalter `verweise` weiter geschrieben').not.toContain('"verweise"');
  expect(ls, 'Alt-Schlüssel `fussnoten` weiter geschrieben').not.toContain('"fussnoten"');
  expect(ls, 'Alt-Schlüssel `histansicht` weiter geschrieben').not.toContain('"histansicht"');

  await page.reload();
  // Pre-Paint (wendeLeserOptionenAn in main.tsx, CSP-konform aus dem Modul-Script):
  // das Attribut steht VOR dem ersten Paint — kein Flash der Fassungs-Zeile.
  await expect(page.locator('html')).toHaveAttribute('data-vermerke', 'aus');
  await expect(page.locator('#art-4')).toBeVisible();
  // Verlustfrei auch nach dem Reload: V und Z stehen, A ist gedämpft.
  await expect(apparatZeile(page, '4', '13')).toBeVisible();
  await expect(apparatZeile(page, '4', '12')).toBeHidden();
  // D40: die Fassungs-Spur nach dem Reload ist die Rubrik-Marke; «aus» nimmt sie.
  // KEINE Zähl-Zusicherung: die A1-Mechanik lässt das Element im DOM stehen
  // (David 5.7.2026, `display:none` statt löschen) — gezählt wird, was der
  // Leser SIEHT, und das müssen null sein.
  expect(await page.locator(`.lc-leser ${F_MARKE}`)
    .evaluateAll((els) => els.filter((e) => (e as HTMLElement).checkVisibility()).length),
  '«aus» lässt Fassungs-Marken stehen').toBe(0);
});

test('MIGRATION im Browser: ein gespeichertes «chronologie» steht als «Fassung» da', async ({ page }) => {
  // Der Bestands-Speicher eines Nutzers von VOR S1 — genau der Fall, der sich
  // später nicht mehr nachstellen lässt. Die Regeln selbst liegen DOM-frei unter
  // `src/tests/leser-optionen-migration.test.ts`; hier zählt, dass der Pre-Paint-
  // Pfad (main.tsx → wendeLeserOptionenAn) sie wirklich anwendet und die Wahl
  // danach richtig steht. «chronologie» hiess «Vermerke sichtbar» ⇒ seit D35-F3
  // die Stellung «Fassung», nie «aus» (§8: dem Nutzer nicht wegnehmen, was er
  // ausdrücklich bestellt hat).
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lm.leser.optionen', JSON.stringify({
        fussnoten: 'an', verweise: 'aus', leitfaelle: 'an', hist: 'chronologie',
      }));
    } catch { /* privater Modus */ }
  });
  await warteReader(page, '/gesetze/bund/BGBM', 'art-2');
  await expect(page.locator('html')).toHaveAttribute('data-vermerke', 'fassung');
  // Die gestrichenen Schalter können nichts mehr bewirken: kein Attribut am <html>.
  await expect(page.locator('html')).not.toHaveAttribute('data-verweise', /.*/);
  await expect(page.locator('html')).not.toHaveAttribute('data-fussnoten', /.*/);
  await expect(page.locator('html')).not.toHaveAttribute('data-histansicht', /.*/);
  await ansichtOeffnen(page);
  await expect(page.getByRole(WAHL_ROLLE, { name: VERMERKE_SCHALTER_NAME }))
    .toHaveAttribute('aria-checked', 'true');
  // Und die Fassung ist wirklich da (nicht bloss die Stellung richtig gesetzt).
  await page.locator('#art-2').scrollIntoViewIfNeeded();
  await fassungsMarke(page.locator('#art-2'));
});

test('H0-Auflage 1: KEINE Klasse ausser A folgt der Wahl — A, G und U auf einem Artikel', async ({ page }) => {
  // Gegenprüfungs-Befund B5 (26.7.2026) in seiner D35-F3-Fassung. Die Sonde ist
  // dieselbe, ihre Richtung ist wieder die ursprüngliche: sie bewacht, dass der
  // CSS-Selektor nicht von `[data-fn-klasse="A"]` auf `[data-fn-klasse]`
  // verbreitert wird. Würde er es, wäre die Verlustfreiheit dahin, und genau
  // hier wird es rot.
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

  for (const stellung of ['fassung', 'aus'] as const) {
    await waehle(page, stellung);
    await expect(u35, `${stellung}: U folgt der Wahl`).toBeVisible();
    await expect(g41, `${stellung}: G folgt der Wahl`).toBeVisible();
    // Und ihr Inhalt ist unverändert lesbar (nicht bloss ein leeres sichtbares Element).
    await expect(u35).toContainText('Beträge angepasst');
    await expect(g41).toContainText('Siehe auch die UeB');
    // ZWEISEITIG: A folgt ihr sehr wohl (§6.7 — sonst wäre die Zusicherung oben
    // mit «nichts ist je ausblendbar» erfüllbar).
    await expect(a34, `${stellung}: A folgt der Wahl nicht`).toBeHidden();
  }

  await waehle(page, 'fussnoten');
  await expect(a34).toBeVisible();
  await expect(a34).toContainText('Fassung gemäss');
});

test('axe: das offene Panel mit der Dreier-Wahl ist sauber', async ({ page }, testInfo) => {
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
  await waehle(page, 'aus');
  await ansichtOeffnen(page);
  await expect(page.getByRole(WAHL_ROLLE, { name: AUS_WAHL_NAME })).toBeVisible();

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
