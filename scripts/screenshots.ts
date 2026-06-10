// Screenshot-Serie für die Design-Abnahmegrundlage (FAHRPLAN-DESIGN 4.6/5.8).
// Fotografiert die von Etappe 4/5 betroffenen Ansichten bei 360/768/1280 px
// (fullPage, reducedMotion) gegen einen laufenden Server — bewusst KEIN
// *.e2e.ts: Artefakt-Erzeugung gehört nicht in die CI-Testsuite.
//
// Aufruf (vite-node):
//   npm run preview -- --port 4321 --strictPort   (bzw. Worktree-Server)
//   npx vite-node scripts/screenshots.ts -- --base-url http://localhost:4321 \
//     --out abnahme/design-2026-06/screenshots/ist-<sha7>
//
// Alte Stände können einzelne Motive/Selektoren nicht kennen — das Skript
// loggt Fehlstellen ehrlich (FEHLT/AKTION-ÜBERSPRUNGEN) statt zu crashen (§8).
import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'node:fs';

const BREITEN = [360, 768, 1280];

// Motiv → Route + optionale Interaktion (nur stabile, build-übergreifende
// Selektoren; alles Weitere zeigt der Default-Zustand).
const MOTIVE: { name: string; route: string; aktion?: (page: Page) => Promise<void> }[] = [
  { name: 'startseite', route: '/' },
  {
    name: 'startseite-register-offen', route: '/',
    aktion: async (page) => {
      // Struktur-Umbau-Stand: Oberkategorie-Kachel «… öffnen»; ältere Stände
      // hatten ?gebiet=-Panels — beides versuchen.
      const knopf = page.getByRole('button', { name: /öffnen$/ }).first();
      if (await knopf.count() > 0) { await knopf.click(); return; }
      await page.goto(page.url() + '?gebiet=Mietrecht');
    },
  },
  { name: 'tagerechner-fristenkalender', route: '/rechner/tagerechner' },
  { name: 'verzugszins-timeline', route: '/rechner/verzugszins' },
  { name: 'kuendigung-timeline', route: '/rechner/kuendigung' },
  { name: 'ag-gruendung-dokumentmappe', route: '/vorlagen/ag-gruendung' },
];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const baseUrl = arg('--base-url') ?? 'http://localhost:4317';
const out = arg('--out');
if (!out) {
  console.error('FEHLER: --out <verzeichnis> fehlt.');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const motiv of MOTIVE) {
  for (const breite of BREITEN) {
    const context = await browser.newContext({
      viewport: { width: breite, height: 844 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    try {
      const antwort = await page.goto(baseUrl + motiv.route, { waitUntil: 'networkidle' });
      if (!antwort || !antwort.ok()) {
        console.log(`FEHLT  ${motiv.name} (${breite}px): Route ${motiv.route} → ${antwort?.status()}`);
        continue;
      }
      if (motiv.aktion) {
        try {
          await motiv.aktion(page);
          await page.waitForLoadState('networkidle');
        } catch (e) {
          console.log(`AKTION-ÜBERSPRUNGEN ${motiv.name} (${breite}px): ${(e as Error).message.split('\n')[0]}`);
        }
      }
      await page.screenshot({ path: `${out}/${motiv.name}--${breite}.png`, fullPage: true });
      console.log(`OK     ${motiv.name}--${breite}.png`);
    } catch (e) {
      console.log(`FEHLER ${motiv.name} (${breite}px): ${(e as Error).message.split('\n')[0]}`);
    } finally {
      await context.close();
    }
  }
}
await browser.close();
