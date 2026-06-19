import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useLocale } from '../locale';

// ─── App-Shell (Build-Plan App-Shell, Phase 3) ─────────────────────────────
//
// Dauerhaft sichtbare LINKE Seitenleiste (Desktop) + schmaler TOP-Streifen,
// Inhalt rechts. Auf Mobil klappt die Seitenleiste zur Off-Canvas-Schublade (☰)
// ein. Navigation lebt allein in der Seitenleiste (navigation.ts, SSoT); der
// Top-Streifen trägt nur Werkzeuge. Die frühere Header-Navigation (vier
// Oberkategorien + Sekundär-Nav) ist entfallen.
export function Shell({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale();
  const { pathname } = useLocation();
  const [schubladeOffen, setSchubladeOffen] = useState(false);
  const schubladeRef = useRef<HTMLDivElement>(null);

  // Schublade bei Routenwechsel schliessen — Render-Phasen-Abgleich statt Effect
  // (React-Muster «adjusting state when props change»).
  const [letzterPfad, setLetzterPfad] = useState(pathname);
  if (pathname !== letzterPfad) { setLetzterPfad(pathname); if (schubladeOffen) setSchubladeOffen(false); }

  // Escape schliesst; Fokus beim Öffnen in den Dialog (SSR-sicher: nur im Effekt).
  useEffect(() => {
    if (!schubladeOffen) return;
    schubladeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSchubladeOffen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [schubladeOffen]);

  return (
    <div className="min-h-screen bg-paper">
      {/* Skip-Link (WCAG 2.4.1): erstes fokussierbares Element, springt in den Inhalt. */}
      <a href="#inhalt"
        className="lc-btn lc-btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50">
        Zum Inhalt springen
      </a>

      <div className="lg:flex">
        {/* Persistente Desktop-Seitenleiste: sticky, eigene Scrollachse. */}
        <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-line"
          style={{ background: 'color-mix(in srgb, var(--paper-sunken) 35%, var(--paper))' }}>
          <Sidebar />
        </aside>

        {/* Rechte Spalte: Top-Streifen + Inhalt + Footer. */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <Topbar onMenu={() => setSchubladeOffen(true)} />

          {/* Persistenter Hinweis bei Nicht-DE-Locale: Inhalte fallen auf Deutsch zurück. */}
          {locale !== 'de' && (
            <div className="bg-warn-bg border-b" style={{ borderColor: 'var(--warn-500)' }}>
              <div className="max-w-content mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-body-s text-warn-700">
                  Diese Sprachfassung ist in Bearbeitung. Inhalte werden vorerst auf Deutsch angezeigt.
                </p>
                <button type="button" onClick={() => setLocale('de')}
                  className="text-body-s font-medium text-warn-700 underline underline-offset-2 hover:opacity-80">
                  Zu Deutsch wechseln
                </button>
              </div>
            </div>
          )}

          <main id="inhalt" tabIndex={-1} aria-label="Hauptinhalt" className="flex-1 w-full focus:outline-none">
            <div className="max-w-content mx-auto px-5 sm:px-6 py-8 sm:py-12">{children}</div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile: Off-Canvas-Schublade mit derselben Seitenleiste — per Portal an
          <body>, weil der backdrop-filter des Streifens sonst einen Containing-
          Block für position:fixed bildet. SSR-sicher: schubladeOffen ist beim
          ersten Render immer false. */}
      {schubladeOffen && createPortal(
        <div className="lg:hidden">
          {/* Abdunkelnder Scrim — themenunabhängig dunkel (bg-ink-900 wäre im
              Dunkelmodus hell und würde aufhellen statt abdunkeln). */}
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSchubladeOffen(false)} aria-hidden />
          <div id="seitenleisten-schublade" ref={schubladeRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Navigation"
            className="fixed top-0 left-0 z-40 h-full w-4/5 max-w-xs bg-paper-raised border-r border-line shadow-lg overflow-y-auto focus:outline-none [&_nav_a]:py-3 [&_nav_summary]:py-3">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-paper-raised">
              <span className="lc-overline">Navigation</span>
              <button type="button" className="lc-btn lc-btn-ghost lc-btn-sm" aria-label="Navigation schliessen" onClick={() => setSchubladeOffen(false)}>
                <span aria-hidden className="text-[1.05rem] leading-none">✕</span>
              </button>
            </div>
            {/* Schublade trägt eigenen Kopf + der mobile Top-Streifen das Logo
                → Marke in der Schublade ausblenden. */}
            <Sidebar onNavigate={() => setSchubladeOffen(false)} markeZeigen={false} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
