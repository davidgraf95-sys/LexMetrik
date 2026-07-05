// W3·14 Responsive-Audit — Bildschirm-/Breakpoint-Sweep (rein lesend, flaggt nur).
//
// Setzt auf dem Playwright-bash-Muster von scripts/screenshots.ts auf (Motiv→Route,
// reducedMotion, fullPage, ehrliches FEHLT-Logging §8), erweitert um die fünf
// W3·14-Breiten und maschinelle Defekt-Checks. Eigene Datei unter abnahme/ statt
// Eingriff in scripts/screenshots.ts — der Audit-Schritt ist rein lesend am Code.
//
// Aufruf (Worktree-Preview auf eigenem Port, nie 4317/4321/4471):
//   npm run build && npm run preview -- --port 4399 --strictPort
//   npx vite-node abnahme/responsive-audit/sweep.ts -- \
//     --base-url http://localhost:4399 --out abnahme/responsive-audit/shots-<sha7>
//
// Ausgabe: je Motiv×Breite ein fullPage-PNG + eine befunde.json (maschinelle
// Checks). PNGs bleiben gitignored; nur BERICHT.md + wenige Beleg-Crops committen.
import { chromium, type Page, type ConsoleMessage } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

// W3·14: Handy hoch · Tablet · Laptop · Desktop · Ultrawide
const BREITEN = [390, 768, 1280, 1536, 2560];

// Seiten-Inventar: repräsentativ über ALLE Rubriken (Startseite, Gesetze-
// Landeplatz/Kanton/Gebiet, Reader Bund gross/klein + Kanton + pdf + International/
// LugÜ, Rechtsprechung Übersicht+Leser, Materialien Browse+Leser, Rechner/Wizards,
// Vorlagen, Kalender). Nur stabile, build-übergreifende Selektoren.
const MOTIVE: { name: string; route: string; aktion?: (page: Page) => Promise<void> }[] = [
  // ── Startseite + Register offen ──
  { name: 'startseite', route: '/' },
  {
    name: 'startseite-register-offen', route: '/',
    aktion: async (page) => {
      const knopf = page.getByRole('button', { name: /öffnen$/ }).first();
      if (await knopf.count() > 0) { await knopf.click(); }
    },
  },
  // ── Gesetze: Landeplatz + Ebenen + Kanton-Seite + Rechtsgebiets-Sicht ──
  //    Param-Kanon (aus Gesetze.tsx): ebene=bund|kanton|international, kt=<KT>,
  //    ansicht=rechtsgebiet (orthogonal).
  { name: 'gesetze-landeplatz', route: '/gesetze' },
  { name: 'gesetze-ebene-kanton', route: '/gesetze?ebene=kanton' },
  { name: 'gesetze-kanton-ZH', route: '/gesetze?ebene=kanton&kt=ZH' },
  { name: 'gesetze-rechtsgebiet', route: '/gesetze?ansicht=rechtsgebiet' },
  // ── Reader Bund gross / klein / Kanton / pdf-embed / LugÜ-Anhänge ──
  { name: 'reader-bund-gross-OR', route: '/gesetze/bund/OR' },
  { name: 'reader-bund-gross-ZGB', route: '/gesetze/bund/ZGB' },
  { name: 'reader-bund-klein-VMWG', route: '/gesetze/bund/VMWG' },
  { name: 'reader-kanton-AG', route: '/gesetze/kanton/AG-291.150' },
  { name: 'reader-pdf-embed-EMRK', route: '/gesetze/bund/EMRK' },
  { name: 'reader-lugue-anhaenge', route: '/gesetze/bund/LUGUE' },
  // ── International / LugÜ (Anhänge!) ──
  { name: 'international-uebersicht', route: '/international' },
  // ── Rechtsprechung: Übersicht + EntscheidLeser ──
  { name: 'rechtsprechung-uebersicht', route: '/rechtsprechung' },
  { name: 'entscheidleser-bge', route: '/rechtsprechung/bge_152_III_137' },
  { name: 'entscheidleser-bger', route: '/rechtsprechung/bger_1C_733_2025' },
  // ── Materialien: Browse + MaterialLeser ──
  { name: 'materialien-uebersicht', route: '/materialien' },
  { name: 'materialleser', route: '/materialien/ESTV-KS-DBG-5A' },
  // ── Rechner-Übersicht + Wizards ──
  { name: 'rechner-uebersicht', route: '/rechner' },
  { name: 'rechner-tagerechner', route: '/rechner/tagerechner' },
  { name: 'rechner-verzugszins', route: '/rechner/verzugszins' },
  { name: 'rechner-kuendigung', route: '/rechner/kuendigung' },
  { name: 'rechner-erbteilung', route: '/rechner/erbteilung' },
  { name: 'rechner-streitwert', route: '/rechner/streitwert' },
  { name: 'rechner-zustaendigkeit', route: '/rechner/zustaendigkeit' },
  // ── Vorlagen-Übersicht + 2 Vorlagen ──
  { name: 'vorlagen-uebersicht', route: '/vorlagen' },
  { name: 'vorlage-ag-gruendung', route: '/vorlagen/ag-gruendung' },
  { name: 'vorlage-arbeitsvertrag', route: '/vorlagen/arbeitsvertrag' },
  // ── «Kalender»: keine eigene Route; Fristenkalender lebt im Tagerechner (ICS). ──
  // ── Statische Rubriken (Randabdeckung) ──
  { name: 'methodik', route: '/methodik' },
  { name: 'einstellungen', route: '/einstellungen' },
];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const baseUrl = arg('--base-url') ?? 'http://localhost:4399';
const out = arg('--out');
if (!out) { console.error('FEHLER: --out <verzeichnis> fehlt.'); process.exit(1); }
mkdirSync(out, { recursive: true });

// ─── Der maschinelle Defekt-Sensor (läuft im Seitenkontext) ───────────────────
// Deterministisch (§2): keine Zufallswerte, feste Schwellen.
function sensor() {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const befunde: { art: string; schwere: string; detail: string }[] = [];

  // 1) Horizontaler Seiten-Overflow
  if (de.scrollWidth > vw + 1) {
    befunde.push({ art: 'seiten-overflow', schwere: 'hoch',
      detail: `documentElement.scrollWidth=${de.scrollWidth} > innerWidth=${vw} (Δ${de.scrollWidth - vw}px)` });
  }

  // Hilfsfunktion: ist das Element SELBST oder ein Vorfahr ein overflow-x-
  // Scrollcontainer (dann ist ein breiter Inhalt erlaubt/gewollt — Chip-Rail,
  // Tab-Streifen, Tabellen-Wrapper). WICHTIG: das Element selbst zählt mit
  // (eine `overflow-x-auto`-Rail scrollt ihren eigenen Inhalt).
  const inScrollX = (el: Element): boolean => {
    let p: Element | null = el;
    while (p) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
      p = p.parentElement;
    }
    return false;
  };

  // 2) Elemente mit scrollWidth ≫ clientWidth AUSSERHALB eines overflow-x-Containers.
  //    Kandidaten fokussiert: table, pre, breite Blöcke.
  const kandidaten = Array.from(document.querySelectorAll('table, pre, [class*="tabelle"], [class*="table"], [class*="overflow"]'));
  const gesehen = new Set<string>();
  for (const el of kandidaten) {
    const sw = (el as HTMLElement).scrollWidth;
    const cw = (el as HTMLElement).clientWidth;
    if (cw > 0 && sw > cw + 4 && !inScrollX(el)) {
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute('class') || '').slice(0, 60);
      const key = tag + '|' + cls + '|' + sw;
      if (gesehen.has(key)) continue; gesehen.add(key);
      befunde.push({ art: 'element-overflow-ausser-scrollx', schwere: 'mittel',
        detail: `<${tag} class="${cls}"> scrollWidth=${sw} > clientWidth=${cw} (Δ${sw - cw}px), kein overflow-x-Vorfahr` });
    }
  }

  // 3) Abgeschnittener Text (Heuristik): overflow:hidden + scrollHeight/scrollWidth-Delta.
  const alle = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,li,td,th,div'));
  let clipCount = 0;
  const clipBeispiele: string[] = [];
  for (const el of alle) {
    const h = el as HTMLElement;
    const cs = getComputedStyle(h);
    if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
      const txt = (h.textContent || '').trim();
      if (!txt) continue;
      const wDelta = h.scrollWidth - h.clientWidth;
      const hDelta = h.scrollHeight - h.clientHeight;
      // Gewollte, KEINE-Defekt-Fälle ausschliessen (sonst systematisches Rauschen):
      //  · text-overflow:ellipsis (bewusste 1-zeilige Kürzung mit «…»)
      //  · -webkit-line-clamp (bewusste mehrzeilige Teaser-Kürzung)
      //  · visuell versteckte Skip-/sr-only-Links (clientWidth ≤ 1)
      const ell = cs.textOverflow === 'ellipsis';
      const lineClamp = cs.webkitLineClamp && cs.webkitLineClamp !== 'none';
      const srOnly = h.clientWidth <= 1 || h.clientHeight <= 1;
      if (!ell && !lineClamp && !srOnly && (wDelta > 6 || hDelta > 6) && h.clientHeight > 0 && h.clientHeight < 400) {
        clipCount++;
        if (clipBeispiele.length < 5) clipBeispiele.push(`<${h.tagName.toLowerCase()}> Δw${wDelta}/Δh${hDelta} "${txt.slice(0, 40)}"`);
      }
    }
  }
  if (clipCount > 0) {
    befunde.push({ art: 'text-clip-heuristik', schwere: 'niedrig',
      detail: `${clipCount} Element(e) overflow:hidden mit Inhalts-Delta ohne ellipsis. Bsp: ${clipBeispiele.join(' · ')}` });
  }

  // 4) Tap-Target < 44px (nur @390 relevant — Aufrufer filtert). Interaktiv sichtbar.
  if (vw <= 430) {
    const interaktiv = Array.from(document.querySelectorAll('a,button,input,select,textarea,[role="button"],[role="link"],[role="tab"],[onclick]'));
    let klein = 0;
    const kleinBsp: string[] = [];
    for (const el of interaktiv) {
      const h = el as HTMLElement;
      const r = h.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue; // unsichtbar / sr-only Skip-Link
      const cs = getComputedStyle(h);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (r.height < 44 || r.width < 44) {
        // sehr kleine Inline-Links im Fliesstext ausnehmen wäre zu grob — wir zählen alle,
        // notieren aber die Grösse; der Bericht wertet Häufungen.
        klein++;
        if (kleinBsp.length < 6) {
          const label = (h.getAttribute('aria-label') || h.textContent || h.getAttribute('title') || '').trim().slice(0, 30);
          kleinBsp.push(`<${h.tagName.toLowerCase()}> ${Math.round(r.width)}×${Math.round(r.height)}px "${label}"`);
        }
      }
    }
    if (klein > 0) {
      befunde.push({ art: 'tap-target-klein', schwere: 'mittel',
        detail: `${klein} interaktive Element(e) < 44px @${vw}. Bsp: ${kleinBsp.join(' · ')}` });
    }
  }

  return { vw, scrollWidth: de.scrollWidth, befunde };
}

// ─── Sweep ────────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
type Zeile = { motiv: string; route: string; breite: number; status: string;
  scrollWidth?: number; konsole: string[]; befunde: { art: string; schwere: string; detail: string }[] };
const bericht: Zeile[] = [];

for (const motiv of MOTIVE) {
  for (const breite of BREITEN) {
    const context = await browser.newContext({
      viewport: { width: breite, height: 900 },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const konsole: string[] = [];
    page.on('console', (m: ConsoleMessage) => { if (m.type() === 'error') konsole.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => konsole.push('pageerror: ' + e.message.slice(0, 200)));
    const zeile: Zeile = { motiv: motiv.name, route: motiv.route, breite, status: 'OK', konsole, befunde: [] };
    try {
      const antwort = await page.goto(baseUrl + motiv.route, { waitUntil: 'networkidle', timeout: 30000 });
      if (!antwort || !antwort.ok()) {
        // SPA-Fallback liefert 200 für Client-Routen; echte 404 hier nur bei harten Fehlern.
        zeile.status = `FEHLT ${antwort?.status()}`;
      }
      if (motiv.aktion) {
        try { await motiv.aktion(page); await page.waitForLoadState('networkidle'); }
        catch (e) { zeile.status += ` AKTION-ÜBERSPRUNGEN:${(e as Error).message.split('\n')[0].slice(0, 80)}`; }
      }
      await page.waitForTimeout(300); // Layout settlen lassen
      const mess = await page.evaluate(sensor);
      zeile.scrollWidth = mess.scrollWidth;
      zeile.befunde = mess.befunde;
      // fullPage crasht bei sehr hohen Reader-Seiten (OR/ZGB > 32k px, Chromium-
      // Textur-Limit). Höhe messen → bei Überlänge auf ~16000px clippen (Kopf +
      // erste Artikel genügen für die visuelle Layout-Prüfung; die maschinellen
      // Checks über den GANZEN DOM liefen bereits oben).
      const docH = await page.evaluate(() => document.documentElement.scrollHeight);
      const CAP = 16000;
      if (docH > CAP) {
        // fullPage crasht bei > ~32k px (Chromium-Textur-Limit); `clip` allein OHNE
        // fullPage bleibt aber auf die Viewport-Höhe geklemmt (nur ~900px sichtbar!).
        // Robust: Viewport auf CAP hochziehen und normal (nicht-fullPage) knipsen —
        // so kommen Kopf + erste ~16000px Inhalt (inkl. erster Anhang-/Tabellen-
        // Blöcke) ins Bild. Die maschinellen Checks liefen bereits über den GANZEN DOM.
        zeile.status += ` [viewport-cap ${docH}→${CAP}px]`;
        await page.setViewportSize({ width: breite, height: CAP });
        await page.waitForTimeout(200);
        await page.screenshot({ path: `${out}/${motiv.name}--${breite}.png`, fullPage: false });
      } else {
        await page.screenshot({ path: `${out}/${motiv.name}--${breite}.png`, fullPage: true });
      }
      const flags = mess.befunde.length ? ' ⚑' + mess.befunde.map((b) => b.art).join(',') : '';
      console.log(`OK     ${motiv.name}--${breite}.png${flags}${konsole.length ? ' [konsole:' + konsole.length + ']' : ''}`);
    } catch (e) {
      zeile.status = `FEHLER ${(e as Error).message.split('\n')[0].slice(0, 100)}`;
      console.log(`FEHLER ${motiv.name} (${breite}px): ${zeile.status}`);
    } finally {
      bericht.push(zeile);
      await context.close();
    }
  }
}
await browser.close();

writeFileSync(`${out}/befunde.json`, JSON.stringify(bericht, null, 2));
const mitBefund = bericht.filter((z) => z.befunde.length > 0 || z.konsole.length > 0 || z.status !== 'OK').length;
console.log(`\n${bericht.length} Seiten×Breiten fotografiert, ${mitBefund} mit Befund/Konsole/Statusabweichung.`);
console.log(`befunde.json + PNGs → ${out}`);
