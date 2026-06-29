import { Suspense, useContext, useMemo, useRef, useState } from 'react';
import { createPath, parsePath, UNSAFE_NavigationContext, type Location, type To } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { RouteSwitch } from '../../RouteSwitch';
import { PaneProvider } from './PaneKontext';

// ─── Sekundäres Split-View-Pane (B-1 + B-3-Navigation) ─────────────────────
//
// Ein zusätzliches Lesefenster, das einen ZWEITEN Erlass/Rechner neben dem
// primären Pane zeigt. Technik: `<RouteSwitch location={loc}>` (= react-routers
// `<Routes location>`) im SELBEN BrowserRouter — react-router v7 verbietet einen
// verschachtelten zweiten Router (MemoryRouter-in-BrowserRouter wirft).
//
// EIGENE Navigation (B-3-vorgezogen): Ein Pane hat eine eigene `loc`-State und
// einen eigenen `navigator` (über UNSAFE_NavigationContext). So aktualisieren
// `useNavigate`/`setSearchParams`/`<Link>` IM Pane NUR das Pane (loc), nie den
// primären BrowserRouter — sonst würde z. B. der Rechtsweg-Umschalter eines
// Rechners im Sekundär-Pane die Haupt-URL kapern (Bugcheck-Major). Das primäre
// Pane bleibt die einzige URL-Quelle.
//
// Eigene <Suspense>+<ErrorBoundary> (ein ladendes/fehlerndes Pane leert die
// anderen nicht), eigener Scroll-Container + `@container/pane` (Container-Query).
//
// §5/§8: KEIN RouteMeta/TabTracker hier — Titel/Reiter treibt allein das primäre
// Pane. Zustandslos: das Pane kennt nur seine(n) Pfad(e), nie Formularinhalt.

function toStr(to: To): string {
  return typeof to === 'string' ? to : createPath(to);
}

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
  onTeilen?: () => Promise<void> | undefined;
}) {
  const wurzel = useRef<HTMLElement>(null);
  const [kopiert, setKopiert] = useState(false);
  // Pane-eigene History + Navigator → das Pane ist eine AUTONOME, voll
  // navigierbare Sicht: Links, Breadcrumbs (RechnerKopf «Übersicht/Katalog»),
  // push/replace UND zurück/vorwärts (go) wirken NUR im Pane, nie im primären
  // BrowserRouter. Den Eltern-NavigationContext erben und nur den navigator
  // ersetzen (future/useTransitions/static/basename bleiben korrekt). Eigener
  // In-Memory-Stack in einer Ref; `tick` erzwingt das Re-Render bei Navigation.
  const elternNav = useContext(UNSAFE_NavigationContext);
  const [hist, setHist] = useState<{ stack: string[]; idx: number }>({ stack: [pfad], idx: 0 });
  const loc = hist.stack[hist.idx];
  const navKontext = useMemo(() => ({
    ...elternNav,
    static: false,
    navigator: {
      ...elternNav.navigator,
      createHref: (to: To) => toStr(to),
      encodeLocation: (to: To) => parsePath(toStr(to)) as Location,
      go: (delta: number) => setHist((h) => ({ ...h, idx: Math.max(0, Math.min(h.stack.length - 1, h.idx + delta)) })),
      push: (to: To) => setHist((h) => {
        const stack = [...h.stack.slice(0, h.idx + 1), toStr(to)];
        return { stack, idx: stack.length - 1 };
      }),
      replace: (to: To) => setHist((h) => {
        const stack = [...h.stack]; stack[h.idx] = toStr(to);
        return { stack, idx: h.idx };
      }),
    },
  }), [elternNav]);
  return (
    <PaneProvider value={{ imPane: true, rolle: 'sekundaer', wurzel }}>
      <section
        ref={wurzel}
        aria-label={label}
        className="@container/pane relative flex-1 min-w-0 overflow-y-auto overscroll-contain border-l border-line focus:outline-none max-lg:flex-none max-lg:w-full max-lg:snap-start"
      >
        {/* Schliessen/Teilen: sticky oben rechts. Die Leiste selbst ist
            pointer-events-none, damit der darunterliegende Seitenkopf (Breadcrumb
            «Übersicht/Katalog») klickbar bleibt — nur die Knöpfe fangen Klicks. */}
        <div className="pointer-events-none sticky top-0 z-10 flex justify-end gap-1.5 p-1.5 [&>button]:pointer-events-auto">
          {onTeilen && (
            <button
              type="button"
              onClick={() => {
                // «kopiert» nur bei tatsächlichem Erfolg (Clipboard kann fehlen/blockiert sein, §8).
                onTeilen()?.then(() => {
                  setKopiert(true);
                  window.setTimeout(() => setKopiert(false), 1600);
                }).catch(() => { /* Clipboard blockiert — kein falsches Feedback */ });
              }}
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
          {/* Eigener Navigator (UNSAFE_NavigationContext) → Navigation bleibt im Pane.
              static:false + leere basename wie im BrowserRouter. */}
          <UNSAFE_NavigationContext.Provider value={navKontext}>
            <ErrorBoundary>
              <Suspense fallback={<Laden />}>
                <RouteSwitch location={loc} />
              </Suspense>
            </ErrorBoundary>
          </UNSAFE_NavigationContext.Provider>
        </div>
      </section>
    </PaneProvider>
  );
}
