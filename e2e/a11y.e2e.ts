// axe-core-Stichprobe (FAHRPLAN-DESIGN 3.7, Zielniveau WCAG 2.1 AA aus
// Etappe 3): Startseite (zu + mit offenem Register-Panel), ein Rechner
// (Tagerechner: DatumsFeld/FristenKalender — grösste A11y-Posten, auch mit
// offenem Kalender-Popover), eine Vorlage (Arbeitsvertrag: Wizard/
// SelectionGrid) und die Zuständigkeit (deckt die PLZ-Auswahl-Kacheln ab).
//
// Tor-Politik (§8): Verstösse mit Impact critical/serious brechen den Test;
// moderate/minor werden als Anhang dokumentiert (Abnahmegrundlage für David,
// abnahme/design-2026-06/BERICHT.md), gaten aber nicht. Bekannte, im Bericht
// begründete Befunde stehen in BEKANNTE_BEFUNDE (Muster BEKANNTER_OVERFLOW,
// smoke.e2e.ts) — nie still erweitern, immer mit Bericht-Eintrag.
import { test, expect, type Page, type TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

// Ohne reduzierte Bewegung misst axe die lc-reveal-Einblendung mitten in der
// Animation (halbtransparenter Text → falsche Kontrast-Befunde, empirisch
// fg #78786f statt ink-500). Die CSS respektiert prefers-reduced-motion
// (index.css); test.use({reducedMotion}) griff hier nicht → explizit
// emulieren, VOR der Interaktion, die die Animation auslöst.
// Theme DETERMINISTISCH pinnen (26.6.2026): ohne gespeicherte Wahl folgt die App
// zeitThema (nach 20:00 dunkel) → axe mass je nach Uhrzeit hell ODER dunkel, also
// flaky. Wir setzen die Wahl per localStorage VOR dem ersten Skript-Lauf und
// emulieren das passende color-scheme. Default 'hell' (Referenzmodus); die
// Reader-Prüfpunkte laufen zusätzlich in 'dunkel' (Kontrast in BEIDEN Modi, §13/F2).
async function oeffnen(page: Page, url: string, thema: 'hell' | 'dunkel' = 'hell') {
  await page.addInitScript((t) => {
    try { localStorage.setItem('lexmetrik-thema', t) } catch { /* privater Modus */ }
  }, thema)
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: thema === 'dunkel' ? 'dark' : 'light' })
  await page.goto(url)
}

// Regel-IDs, die als bekannt/begründet NICHT gaten (je Prüfpunkt).
// Eintrag NUR mit zugehörigem Befund-Eintrag im BERICHT.md.
// - link-in-text-block: Inline-Links (brass-700) sind nur farblich vom
//   Fliesstext unterschieden — `no-underline` ist Markenentscheid; Hebung
//   (Unterstreichung o. Ä.) = Entscheid David (BERICHT.md B-2).
// - color-contrast (nur tagerechner): FristenKalender Sa/So/arbeitsfrei in
//   ink-400 = dokumentierter E3-Kompromiss (FAHRPLAN-DESIGN 3.5,
//   «Abschwächung ist Gestaltungsabsicht; Info zusätzlich in title+Legende»);
//   Hebung = Entscheid David (BERICHT.md B-1).
const BEKANNTE_BEFUNDE: Record<string, string[]> = {
  'startseite': ['link-in-text-block'],
  'startseite-suche': ['link-in-text-block'],
  'tagerechner': ['link-in-text-block'],
  'tagerechner-kalender': ['link-in-text-block'],
  'vorlage-arbeitsvertrag': ['link-in-text-block'],
  'zustaendigkeit-plz-wahl': ['link-in-text-block'],
  // W3.6 (25.6.2026): die früher hier dokumentierten color-contrast-Befunde
  // (gedämpftes «aufgehoben»/Zitiermarke/Meta in ink-400) sind GEFIXT — der
  // gesamte faintest-Text-Tier wurde ink-400→ink-500 gehoben (AA ≥4.5:1 in hell
  // UND dunkel, per axe in beiden Modi auf 0 verifiziert). 'color-contrast' ist
  // daher hier NICHT mehr whitelisted; ein neuer Kontrast-Verstoss gatet wieder.
  // Bleibt: link-in-text-block = Inline-SR/Norm-Link-Marken ohne Unterstreichung
  // (B-2 Markenentscheid, scheme-unabhängig).
  'gesetze-kanton-BS': ['link-in-text-block'],
  'gesetze-leser-BS': ['link-in-text-block'],
  'gesetze-leser-bund': ['link-in-text-block'],
  // /suche (UI-NAV S5): Inline-Links (Abdeckung/«Was ist durchsuchbar») + die
  // brass-Trefferlinks tragen denselben Markenentscheid (B-2, no-underline).
  'suche-seite': ['link-in-text-block'],
  'rechtsprechung-uebersicht': ['link-in-text-block'],
  // BS-Facette/-Reader (W2·6-BS Block B): dieselben Inline-Link-Marken (B-2).
  'rechtsprechung-uebersicht-bs': ['link-in-text-block'],
  'rechtsprechung-leser': ['link-in-text-block'],
  'rechtsprechung-leser-bs': ['link-in-text-block'],
  'international': ['link-in-text-block'],
  // Tab-Streifen-Prüfpunkt lädt /rechner/tagerechner: derselbe dokumentierte
  // Inline-Link-Marken-Entscheid (B-2) der Seite. Der Streifen SELBST ist
  // a11y-sauber (keine tablist/tab-Rollen, Kontraste auf ink-500/600 gehoben).
  'tab-streifen': ['link-in-text-block'],
}

async function axePruefen(page: Page, testInfo: TestInfo, punkt: string) {
  const ergebnis = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  const bekannt = new Set(BEKANNTE_BEFUNDE[punkt] ?? [])
  const schwer = ergebnis.violations.filter(
    (v) => (v.impact === 'critical' || v.impact === 'serious') && !bekannt.has(v.id),
  )
  const dokumentieren = ergebnis.violations.filter((v) => !schwer.includes(v))
  if (dokumentieren.length > 0) {
    await testInfo.attach(`${punkt}-befunde-dokumentiert.json`, {
      body: JSON.stringify(
        dokumentieren.map((v) => ({
          id: v.id, impact: v.impact, help: v.help,
          knoten: v.nodes.map((n) => n.target.join(' ')),
        })),
        null, 2,
      ),
      contentType: 'application/json',
    })
  }
  expect(
    schwer.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} Knoten, z. B. ${v.nodes[0]?.target.join(' ')} | ${(v.nodes[0]?.failureSummary ?? '').replace(/\n/g, ' ').slice(0, 200)}`),
    `axe ${punkt}: keine critical/serious-Verstösse`,
  ).toEqual([])
}

test('Startseite', async ({ page }, testInfo) => {
  await oeffnen(page, '/')
  await expect(page.locator('h1').first()).toBeVisible()
  await axePruefen(page, testInfo, 'startseite')
})

test('Startseite mit offener Universal-Suche', async ({ page }, testInfo) => {
  // Startseiten-Überarbeitung: der frühere Katalog-«Register-Panel»-Zustand
  // existiert auf «/» nicht mehr (Katalog lebt auf /recherche). Geprüft wird
  // stattdessen der wichtigste neue interaktive Zustand — die offene Universal-
  // Suche mit gruppierter Trefferliste (Katalog-Gruppe rendert synchron, ohne
  // Lazy-Daten, daher sofort sichtbar).
  await oeffnen(page, '/')
  await page.locator('section[role="search"] input[type="search"]').fill('kündigung')
  await page.locator('section[role="search"] .lc-card').waitFor({ state: 'visible' })
  await axePruefen(page, testInfo, 'startseite-suche')
})

test('Tagerechner', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechner/tagerechner')
  await expect(page.locator('h1').first()).toBeVisible()
  await axePruefen(page, testInfo, 'tagerechner')
})

// In-App-Reiter-Übersicht (Gesetze-UX Batch 2 ersetzte den horizontalen
// TabStreifen durch einen Topbar-Trigger ☰ + Dialog-Panel). 2 Reiter vorab
// seeden, sonst ist der Trigger unsichtbar (tabs.length < 1). Geprüft wird der
// sichtbare Trigger UND das geöffnete Dialog-Panel (die reiche interaktive Fläche).
test('Reiter-Übersicht mit zwei offenen Reitern', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('lexmetrik-tabs', JSON.stringify([
        { path: '/rechner/tagerechner' }, { path: '/rechner/verzugszins' },
      ]))
    } catch { /* privater Modus */ }
  })
  await oeffnen(page, '/rechner/tagerechner')
  const trigger = page.getByRole('button', { name: 'Alle geöffneten Reiter' })
  await trigger.waitFor({ state: 'visible' })
  await trigger.click()
  await page.getByRole('dialog', { name: 'Alle geöffneten Reiter' }).waitFor({ state: 'visible' })
  await axePruefen(page, testInfo, 'tab-streifen')
})

test('Tagerechner mit offenem Kalender-Popover', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechner/tagerechner')
  await page.getByRole('button', { name: 'Kalender öffnen' }).first().click()
  await expect(page.getByRole('dialog', { name: 'Kalender' })).toBeVisible()
  await axePruefen(page, testInfo, 'tagerechner-kalender')
})

test('Vorlage Arbeitsvertrag', async ({ page }, testInfo) => {
  await oeffnen(page, '/vorlagen/arbeitsvertrag')
  await expect(page.locator('h1').first()).toBeVisible()
  await axePruefen(page, testInfo, 'vorlage-arbeitsvertrag')
})

test('Zuständigkeit mit PLZ-Auswahl-Kacheln', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechner/zustaendigkeit#schkg')
  await page.getByLabel('Postleitzahl des Betreibungsortes').fill('1041')
  await expect(page.getByRole('button', { name: /Bottens/ })).toBeVisible()
  await axePruefen(page, testInfo, 'zustaendigkeit-plz-wahl')
})

// Gesetze-Seite (BS-Audit 23.6.2026, S11): bisher deckte das axe-Tor die Rubrik
// V gar nicht ab — der SR-Nr-Kontrastfehler (S10) konnte ungebremst deployen.
// (1) Kanton-Übersicht BS eingeklappt (Systematik-Köpfe, SR-Nr-Zeilen, Pills),
// (2) ein Reader (BS-640.100) — die beiden Orte der UI-Quick-Wins.
test('Gesetze — Kanton BS (eingeklappt)', async ({ page }, testInfo) => {
  await oeffnen(page, '/gesetze?ebene=kanton&kt=BS')
  await expect(page.getByRole('heading', { name: 'Schweizer Gesetzessammlung' })).toBeVisible()
  // Kanton-Header (Wappen + Name) ist da, die Systematik gerendert.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'gesetze-kanton-BS')
})

test('Gesetze — Reader BS-640.100', async ({ page }, testInfo) => {
  await oeffnen(page, '/gesetze/kanton/BS-640.100')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'gesetze-leser-BS')
})

// W1.7 (SEO W1.1-Detailseiten + bisher ungetestete Rubriken): Rechtsprechung +
// International + ein Bund-Reader ins Tor ziehen. Strukturell a11y-sauber
// verifiziert (nur link-in-text-block/B-2; color-contrast nach W3.6 = 0).
// Bund-Reader an einem KLEINEN Erlass (GebV-HReg, 11 Art.) statt OR (1099 Art.,
// axe-Timeout): gleiche GesetzLeser-Komponente, und als Gebührenverordnung mit
// Tarif-/Mehrspalten-Tabelle deckt sie den scrollable-region-Fix (tabIndex) ab.
test('Gesetze — Reader Bund (GebV-HReg, Tarif-Tabelle)', async ({ page }, testInfo) => {
  await oeffnen(page, '/gesetze/bund/GEBV_HREG')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'gesetze-leser-bund')
})

test('Rechtsprechung — Übersicht', async ({ page }, testInfo) => {
  // Budget 120 s statt 60 s (§6.3 INFRASTRUKTUR, kein Assertion-Change): vor dem
  // Listen-DOM-Deckel (BS-Tranche §7.1, Rechtsprechung.tsx LISTE_DECKEL=100)
  // renderte die Übersicht den GESAMTEN Korpus ungeblättert — axe.analyze brauchte
  // lokal ~25 s, auf dem 4×-gedrosselten CI-Runner riss das das 60-s-Budget. Der
  // Deckel begrenzt das DOM jetzt auf ~100 Zeilen je Sektion; die 120 s bleiben
  // als Sicherheitsmarge gegen CI-Starvation stehen (greifen nur bei Überschreitung).
  testInfo.setTimeout(120_000)
  await oeffnen(page, '/rechtsprechung')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'rechtsprechung-uebersicht')
})

// BS-Tranche (W2·6-BS Block B): dieselbe Übersicht mit aktiver BS-Facette —
// deckt die BS-Zeilen (amtl.-Betreff-Marker, «o. D.»-Datumszellen) + den
// «Weitere anzeigen»-Knopf des DOM-Deckels a11y ab.
test('Rechtsprechung — Übersicht, Facette BS', async ({ page }, testInfo) => {
  testInfo.setTimeout(120_000)
  await oeffnen(page, '/rechtsprechung')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: /^Gemeinwesen: BS \(\d+\)$/ }).click()
  await expect(page.locator('a[href^="/rechtsprechung/bs_"]').first()).toBeVisible()
  await axePruefen(page, testInfo, 'rechtsprechung-uebersicht-bs')
})

// BS-Reader (kantonaler Entscheid, Word-Marker-Gliederung): heller UND dunkler
// Modus — Kontrast der neuen Meta-Elemente (Sekundärnummer, Betreff/`o. D.`).
test('Rechtsprechung — BS-Entscheid-Reader', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechtsprechung/bs_appellationsgericht_AUS.2026.54')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'rechtsprechung-leser-bs')
})

test('Rechtsprechung — BS-Entscheid-Reader (dunkel)', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechtsprechung/bs_appellationsgericht_AUS.2026.54', 'dunkel')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'rechtsprechung-leser-bs')
})

// UI-NAV S5: die /suche-Ergebnisseite mit Treffern (Gruppen-Landmarken,
// Facetten-Buttons, Trefferlisten) a11y-sauber.
test('Suche — Ergebnisseite (S5)', async ({ page }, testInfo) => {
  await oeffnen(page, '/suche?q=Miete')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Gesetzestext', exact: true })).toBeVisible()
  await axePruefen(page, testInfo, 'suche-seite')
})

test('Rechtsprechung — Entscheid-Reader', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechtsprechung/bger_1B_278_2022')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'rechtsprechung-leser')
})

test('International — Übersicht', async ({ page }, testInfo) => {
  await oeffnen(page, '/international')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'international')
})

// Dunkelmodus-Abdeckung (§13/F2): dieselben Reader-Prüfpunkte explizit in
// 'dunkel' — fängt Kontrast-Verstösse, die nur im Dunkel auftreten (z. B. der
// gedämpfte «aufgehoben»-Tier), unabhängig von der Uhrzeit/zeitThema.
test('Gesetze — Reader BS-640.100 (dunkel)', async ({ page }, testInfo) => {
  await oeffnen(page, '/gesetze/kanton/BS-640.100', 'dunkel')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'gesetze-leser-BS')
})

test('Rechtsprechung — Entscheid-Reader (dunkel)', async ({ page }, testInfo) => {
  await oeffnen(page, '/rechtsprechung/bger_1B_278_2022', 'dunkel')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await axePruefen(page, testInfo, 'rechtsprechung-leser')
})

// W1.8 (SEO/A11y-Fahrplan): Heading-Hierarchie. heading-order/page-has-heading-
// one/empty-heading sind axe-BEST-PRACTICE-Regeln, die das Haupt-Tor oben
// (withTags wcag2a/aa) NICHT fährt. Diagnose 27.6.2026: 0 Verstösse über alle
// Rubriken → hier als Regressionsschutz festgenagelt. Eigener Lauf mit
// withRules, damit das Haupt-axePruefen nicht das gesamte best-practice-Set
// einzieht (das brächte viele neue, ungeprüfte Regel-IDs ins Tor).
const HEADING_REGELN = ['heading-order', 'page-has-heading-one', 'empty-heading']
const HEADING_ROUTEN: Array<[string, string]> = [
  ['/', 'startseite'],
  ['/rechner/tagerechner', 'tagerechner'],
  ['/vorlagen/arbeitsvertrag', 'vorlage'],
  ['/gesetze?ebene=kanton&kt=BS', 'gesetze-uebersicht'],
  ['/gesetze/kanton/BS-640.100', 'gesetze-leser-BS'],
  ['/gesetze/bund/GEBV_HREG', 'gesetze-leser-bund'],
  ['/rechtsprechung', 'rechtsprechung-uebersicht'],
  ['/rechtsprechung/bger_1B_278_2022', 'entscheid-leser'],
  ['/international', 'international'],
  ['/materialien', 'materialien'],
]
for (const [url, name] of HEADING_ROUTEN) {
  test(`Heading-Hierarchie — ${name}`, async ({ page }) => {
    await oeffnen(page, url)
    await expect(page.locator('h1').first()).toBeVisible()
    const res = await new AxeBuilder({ page }).withRules(HEADING_REGELN).analyze()
    expect(
      res.violations.map((v) => `${v.id}: ${v.nodes.length} Knoten, z. B. ${v.nodes[0]?.target.join(' ')}`),
      `heading ${name}: keine heading-order/h1/empty-heading-Verstösse`,
    ).toEqual([])
  })
}
