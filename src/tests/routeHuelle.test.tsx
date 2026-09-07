import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { RouteHuelle } from '../components/layout/RouteHuelle';
import { PaneProvider } from '../components/layout/PaneKontext';

// ─── A-6 (W2·19-DESIGN-KONSISTENZ, 31.8.2026) · EINE ROUTEN-HÜLLE ───────────
//
// Fade · Suspense-Fallback mit Höhenreservierung · `ErrorBoundary key={pathname}`
// standen nur in `App.tsx`; das sekundäre Pane rendert denselben `RouteSwitch`
// und hatte keine der drei Zusagen (Gegenüberstellung im Kopf von
// `layout/RouteHuelle.tsx`).
//
// WARUM QUELLENSONDEN und keine Remount-Prüfung: dieses Repo testet ohne DOM
// (`renderToString`, kein jsdom) — ein `key`-Wechsel lässt sich damit nicht
// beobachten. Die Sonden prüfen darum die ZUSAGE an ihrer Entstehungsstelle,
// nach dem Muster von `leser-v3-fundament.test.ts`.
//
// ROT ZU BEKOMMEN (§6.7, am 31.8.2026 gesehen): in `RouteHuelle.tsx` das
// `key={schluessel}` an der ErrorBoundary entfernen; oder in `Pane.tsx` die
// eigene `Suspense`-Kette wiederherstellen.

const IM_PANE = { imPane: true as const, rolle: 'sekundaer' as const, wurzel: null, overlayWurzel: null };

describe('A-6 — RouteHuelle: der Fade gilt in beiden Flächen', () => {
  it('POSITIV-SONDE: die Hülle rendert ihren Inhalt und den Fade-Knoten', () => {
    const html = renderToString(<RouteHuelle schluessel="/gesetze"><p>Inhalt</p></RouteHuelle>);
    expect(html).toContain('lc-route');
    expect(html).toContain('Inhalt');
  });

  it('im Pane dieselbe Hülle — der Routenwechsel sprang dort bis 31.8.2026 hart um', () => {
    const html = renderToString(
      <PaneProvider value={IM_PANE}><RouteHuelle schluessel="/gesetze"><p>Inhalt</p></RouteHuelle></PaneProvider>,
    );
    expect(html).toContain('lc-route');
  });
});

describe('A-6 — die drei Zusagen stehen genau einmal', () => {
  const huelle = readFileSync('src/components/layout/RouteHuelle.tsx', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  const pane = readFileSync('src/components/layout/Pane.tsx', 'utf8');

  it('die Hülle bindet BEIDE Schlüssel an `schluessel` (Fehler-Reset + Fade)', () => {
    expect(huelle).toContain('<ErrorBoundary key={schluessel}>');
    // GB-1 (W2·24, 7.9.2026): die Huelle sagt zusaetzlich das Register des
    // Pfades an (`data-reg`, Herleitung in `RouteHuelle.tsx`). Die ZUSAGE
    // dieses Tests ist unveraendert — beide Schluessel haengen weiterhin an
    // `schluessel`; erweitert ist allein das Attribut dazwischen.
    expect(huelle).toContain('<div key={schluessel} className="lc-route" data-reg=');
  });

  it('die Hülle reserviert die Ladehöhe — je Fläche die passende Zahl', () => {
    expect(huelle).toContain("pk('min-h-screen', 'min-h-[24rem]')");
  });

  it('BEIDE Flächen konsumieren sie — und keine baut die Kette noch selbst', () => {
    for (const [name, quelle] of [['App.tsx', app], ['Pane.tsx', pane]] as const) {
      expect(quelle, `${name} konsumiert die Hülle nicht`).toContain('<RouteHuelle schluessel=');
      expect(quelle.includes('<Suspense'), `${name} baut wieder eine eigene Suspense-Kette`).toBe(false);
      expect(quelle.includes('<ErrorBoundary'), `${name} baut wieder eine eigene ErrorBoundary`).toBe(false);
    }
  });

  it('der Pane-Schlüssel ist der PFAD ohne Query (kein Remount bei ?q=)', () => {
    expect(pane).toContain('parsePath(loc).pathname');
  });
});
