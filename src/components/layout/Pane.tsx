import { Suspense, useContext, useMemo, useRef, useState, type DragEvent } from 'react';
import { createPath, parsePath, UNSAFE_NavigationContext, type Location, type To } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { RouteSwitch } from '../../RouteSwitch';
import { PaneProvider } from './PaneKontext';
import { PaneKopf } from './PaneKopf';

// ─── Sekundäres Split-View-Pane («Browser-Fenster»-Modell) ──────────────────
//
// Autonome, voll navigierbare Sicht neben dem primären Pane. Aufbau:
//   Spalte (flex-col)
//     ├─ PaneKopf            (Titelleiste: Label·Stand·⠿·◂▸·Hauptfenster·teilen·✕)
//     └─ relative-Wrapper
//          ├─ Scroll-div (@container/pane, overflow) ── der Inhalt (RouteSwitch)
//          └─ Overlay-div (absolute, pointer-events-none) ── Drawer/Suche portalieren
//             hierhin → bleiben IM Pane (kein fixed-Bleed über beide Panes).
//
// EIGENE History + Navigator (UNSAFE_NavigationContext): Links/Breadcrumbs/zurück
// wirken NUR im Pane, nie im primären BrowserRouter. §5/§8: kein RouteMeta/
// TabTracker; zustandslos (nur Pfade). §3: reine Darstellung.

function toStr(to: To): string {
  return typeof to === 'string' ? to : createPath(to);
}

function Laden() {
  return (
    <div className="py-16 text-center space-y-3">
      <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
      <p className="text-body-s text-ink-500">Wird geladen …</p>
    </div>
  );
}

export interface SekundaerPaneProps {
  pfad: string;
  label: string;
  stand?: string | null;
  onSchliessen: () => void;
  onHauptfenster: () => void;
  onTeilen?: () => void;
  onLinks?: () => void;
  onRechts?: () => void;
  kannLinks?: boolean;
  kannRechts?: boolean;
  ziehbar?: boolean;
  /** Drag-Drop: Griff (Kopf) + Spalte (Drop-Ziel). */
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  /** true = Drop-Indikator an dieser Spalte zeigen. */
  ueber?: boolean;
}

export function SekundaerPane(props: SekundaerPaneProps) {
  const { pfad, label, stand, onSchliessen, onHauptfenster, onTeilen, onLinks, onRechts,
    kannLinks, kannRechts, ziehbar, onDragStart, onDragEnd, onDragOver, onDrop, ueber } = props;
  const wurzel = useRef<HTMLElement>(null);
  const overlayWurzel = useRef<HTMLDivElement>(null);
  // Pane-eigene History + Navigator.
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
    <PaneProvider value={{ imPane: true, rolle: 'sekundaer', wurzel, overlayWurzel }}>
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex flex-col flex-1 min-w-0 border-l ${ueber ? 'border-l-2 border-l-brass-500' : 'border-line'} max-lg:flex-none max-lg:w-full max-lg:snap-start`}
      >
        <PaneKopf
          label={label} stand={stand} rolle="sekundaer"
          onSchliessen={onSchliessen} onHauptfenster={onHauptfenster} onTeilen={onTeilen}
          onLinks={onLinks} onRechts={onRechts} kannLinks={kannLinks} kannRechts={kannRechts}
          ziehbar={ziehbar} onDragStart={onDragStart} onDragEnd={onDragEnd}
        />
        <div className="relative flex-1 min-h-0">
          <section ref={wurzel} aria-label={label} tabIndex={-1} data-pane="sekundaer"
            className="@container/pane absolute inset-0 overflow-y-auto overscroll-contain focus:outline-none">
            <div className="mx-auto w-full max-w-content px-5 sm:px-6 py-6">
              <UNSAFE_NavigationContext.Provider value={navKontext}>
                <ErrorBoundary>
                  <Suspense fallback={<Laden />}>
                    <RouteSwitch location={loc} />
                  </Suspense>
                </ErrorBoundary>
              </UNSAFE_NavigationContext.Provider>
            </div>
          </section>
          {/* Overlay-Schicht: Pane-Drawer portalieren hierhin (absolute → im Pane). */}
          <div ref={overlayWurzel} className="pointer-events-none absolute inset-0 overflow-hidden" />
        </div>
      </div>
    </PaneProvider>
  );
}
