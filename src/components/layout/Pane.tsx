import { Suspense, useRef, useState } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { RouteSwitch } from '../../RouteSwitch';
import { PaneProvider } from './PaneKontext';

// ─── Sekundäres Split-View-Pane (B-1) ──────────────────────────────────────
//
// Ein zusätzliches Lesefenster, das einen ZWEITEN Erlass/Rechner neben dem
// primären Pane zeigt. Technik: `<RouteSwitch location={pfad}>` (= react-routers
// `<Routes location>`), das die Seite für DIESEN Pfad im SELBEN BrowserRouter
// rendert — react-router v7 verbietet einen verschachtelten zweiten Router
// (MemoryRouter-in-BrowserRouter wirft, empirisch im B-1-Smoke bestätigt).
//
// Eigene <Suspense>+<ErrorBoundary> (ein ladendes/fehlerndes Pane leert die
// anderen nicht), eigener Scroll-Container + `@container/pane` (Container-Query
// → pane-fähige Layouts reagieren auf die PANE-Breite, nicht den Viewport).
//
// §5/§8: KEIN RouteMeta/TabTracker hier — Titel/Reiter treibt allein das primäre
// Pane (B3). Derselbe Routen-Baum (RouteSwitch), nur an anderer Location.
// Zustandslos: das Pane kennt nur seinen Pfad.
//
// GRENZE B-1 (→ B-3): Die Sicht ist auf `pfad` fixiert; ein Klick auf einen
// echten Router-Link IM Pane navigiert noch das primäre (URL-)Pane. Interne
// #Anker (Artikel) scrollen lokal. Eigene Pane-Navigation kommt in B-3.

function Laden() {
  // Identisch zum App-Suspense-Fallback (FAHRPLAN-DESIGN 5.3).
  return (
    <div className="py-16 text-center space-y-3">
      <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
      <p className="text-body-s text-ink-500">Wird geladen …</p>
    </div>
  );
}

export function SekundaerPane({ pfad, label, onSchliessen, onTeilen }: {
  pfad: string;
  label: string;
  onSchliessen: () => void;
  onTeilen?: () => void;
}) {
  const wurzel = useRef<HTMLElement>(null);
  const [kopiert, setKopiert] = useState(false);
  return (
    <PaneProvider value={{ imPane: true, rolle: 'sekundaer', wurzel }}>
      <section
        ref={wurzel}
        aria-label={label}
        className="@container/pane relative flex-1 min-w-0 overflow-y-auto overscroll-contain border-l border-line focus:outline-none max-lg:flex-none max-lg:w-full max-lg:snap-start"
      >
        {/* Schliessen-Knopf: sticky oben rechts, damit das Pane jederzeit
            wieder geschlossen werden kann (kein Sackgassen-Zustand). */}
        <div className="sticky top-0 z-10 flex justify-end gap-1.5 p-1.5">
          {onTeilen && (
            <button
              type="button"
              onClick={() => { onTeilen(); setKopiert(true); window.setTimeout(() => setKopiert(false), 1600); }}
              aria-label="Layout-Link kopieren"
              title={kopiert ? 'Link kopiert' : 'Layout-Link kopieren'}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface px-2 text-micro text-ink-600 hover:text-ink-900 hover:border-brass-400 transition-colors"
            >
              <span aria-hidden className="text-base leading-none">⧉</span>{kopiert ? 'kopiert' : 'teilen'}
            </button>
          )}
          <button
            type="button"
            onClick={onSchliessen}
            aria-label={`Pane schliessen: ${label}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-ink-600 hover:text-ink-900 hover:border-brass-400 transition-colors"
          >
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>
        <div className="mx-auto w-full max-w-content px-5 sm:px-6 pb-8 -mt-7">
          <ErrorBoundary>
            <Suspense fallback={<Laden />}>
              <RouteSwitch location={pfad} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </PaneProvider>
  );
}
