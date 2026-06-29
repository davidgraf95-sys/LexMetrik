import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useLocale } from '../locale';
import { useSeitenleiste, BREITE_MIN, BREITE_MAX, BREITE_SCHRITT } from './useSeitenleiste';
import { useInhaltsbreite } from './useInhaltsbreite';
import { usePaneLayout, PaneSteuerungProvider, MAX_SEKUNDAER, layoutPermalink } from './usePaneLayout';
import { SekundaerPane } from './Pane';
import { PaneKopf } from './PaneKopf';
import { PaneProvider } from './PaneKontext';
import { tabSchluessel } from '../../lib/tabs';
import { verlaufLabel, erlassVonPfad, type VerlaufManifeste } from '../../lib/verlaufLabel';
import { useDialogFokus } from './useDialogFokus';

// Neutraler Pane-Kontext für den 1-Pane-Fall (DOM-/verhaltensneutral, stabil).
const KEIN_PANE = { imPane: false, rolle: 'primaer' as const, wurzel: null, overlayWurzel: null };

// Ziehgriff am rechten Rand der Desktop-Seitenleiste: Breite per Maus/Touch
// ziehen ODER per Tastatur (Pfeil ←/→) verstellen. role="separator" mit
// aria-valuenow/min/max macht die Geste WCAG-zugänglich (axe-Tor). Reine
// Darstellung (§3).
function ZiehGriff({ breite, setBreite }: { breite: number; setBreite: (b: number) => void }) {
  // Teardown des laufenden Drags in einer Ref, damit ein Unmount MITTEN im Ziehen
  // die window-Listener trotzdem löst (kein Leak).
  const aufRef = useRef<(() => void) | null>(null);
  useEffect(() => () => aufRef.current?.(), []);
  const ziehen = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startB = breite;
    const move = (ev: PointerEvent) => setBreite(startB + (ev.clientX - startX));
    const auf = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', auf);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      aufRef.current = null;
    };
    aufRef.current = auf;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', auf);
  };
  const taste = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setBreite(breite - BREITE_SCHRITT); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setBreite(breite + BREITE_SCHRITT); }
  };
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Breite der Seitenleiste anpassen"
      aria-valuenow={breite}
      aria-valuemin={BREITE_MIN}
      aria-valuemax={BREITE_MAX}
      tabIndex={0}
      onPointerDown={ziehen}
      onKeyDown={taste}
      className="hidden lg:block shrink-0 sticky top-0 h-screen w-1.5 -ml-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-brass-300/60 focus:bg-brass-400"
    />
  );
}

// ─── App-Shell (Build-Plan App-Shell, Phase 3) ─────────────────────────────
//
// Dauerhaft sichtbare LINKE Seitenleiste (Desktop) + schmaler TOP-Streifen,
// Inhalt rechts. Auf Mobil klappt die Seitenleiste zur Off-Canvas-Schublade (☰)
// ein. Navigation lebt allein in der Seitenleiste (navigation.ts, SSoT); der
// Top-Streifen trägt nur Werkzeuge. Die frühere Header-Navigation (vier
// Oberkategorien + Sekundär-Nav) ist entfallen.
export function Shell({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [schubladeOffen, setSchubladeOffen] = useState(false);
  const schubladeRef = useRef<HTMLDivElement>(null);
  const primaerWurzel = useRef<HTMLElement>(null); // Scroll-/Query-Wurzel des primären Panes (B-2.5)
  const primaerOverlay = useRef<HTMLDivElement>(null); // Overlay-Schicht des primären Panes (Drawer)
  const seitenleiste = useSeitenleiste();
  const inhaltsbreite = useInhaltsbreite();

  // Inhaltsspalte: kompakt = heutige schmale Spalte (Golden byte-gleich),
  // breit = grosszügiger auf grossen Schirmen. Lesespalte `max-w-reading`
  // (Fliesstext) bleibt unberührt (§13.2). Banner + Inhalt teilen die Klasse,
  // damit der Hinweisstreifen mit dem Inhalt fluchtet.
  const inhaltsbreiteKlasse = inhaltsbreite.breit ? 'max-w-screen-2xl' : 'max-w-content';

  // Split-View (B-1): sekundäre Panes nur ab lg nebeneinander; mobil + Prerender
  // = 1 Pane (istLg startet false → SSR/Default byte-gleich, B-4-Faltung gratis).
  const pane = usePaneLayout();
  const [istLg, setIstLg] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const upd = () => setIstLg(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);
  // Multipane sobald ein sekundäres Pane existiert. Responsiv: ab lg nebeneinander,
  // darunter (B-4) horizontales Swipe-/Snap-Falten (1 Pane sichtbar, wischen). Der
  // Default (keine Panes) bleibt der byte-gleiche 1-Pane-Pfad (Prerender hat nie Panes).
  const multipane = pane.sekundaer.length > 0;
  // Scroll-Übergabe beim Moduswechsel: in 1-Pane scrollt das Fenster, im Multipane
  // das primäre Pane. Ohne Übergabe spränge die Leseposition beim Öffnen/Schliessen
  // auf 0 — wir merken den Scroll der aktuellen Quelle und übertragen ihn (rAF).
  const scrollMerk = useRef(0);
  useEffect(() => {
    const ziel = multipane ? primaerWurzel.current : null;
    const lese = () => { scrollMerk.current = ziel ? ziel.scrollTop : window.scrollY; };
    const el: HTMLElement | Window = ziel ?? window;
    el.addEventListener('scroll', lese, { passive: true });
    return () => el.removeEventListener('scroll', lese);
  }, [multipane]);
  useEffect(() => {
    const y = scrollMerk.current;
    const id = requestAnimationFrame(() => {
      if (multipane) { if (primaerWurzel.current) primaerWurzel.current.scrollTop = y; }
      else { window.scrollTo(0, y); }
    });
    return () => cancelAnimationFrame(id);
  }, [multipane]);
  // B-3a: F6 / Shift+F6 wechselt den Fokus zyklisch zwischen den Panes
  // (Standard-Regionswechsel-Taste). Jedes Pane trägt `data-pane` + tabIndex=-1.
  useEffect(() => {
    if (!multipane) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'F6') return;
      // Offenen modalen Dialog nicht verlassen (Fokus-Falle respektieren).
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const panes = Array.from(document.querySelectorAll<HTMLElement>('[data-pane]'));
      if (panes.length < 2) return;
      e.preventDefault();
      const aktiv = document.activeElement;
      let idx = panes.findIndex((p) => p === aktiv || p.contains(aktiv));
      if (idx === -1) idx = 0;
      panes[(idx + (e.shiftKey ? -1 : 1) + panes.length) % panes.length].focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [multipane]);
  // Pane-Titel/Stand: Manifeste lazy laden, sobald multipane (Label für Gesetz/Entscheid).
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  useEffect(() => {
    if (!multipane) return;
    let lebt = true;
    void (async () => {
      const [g, e] = await Promise.all([
        import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()).catch(() => null),
        import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()).catch(() => null),
      ]);
      if (lebt) setManifeste({ gesetze: g, entscheide: e });
    })();
    return () => { lebt = false; };
  }, [multipane]);
  // Live-Location je Pane (gekeyt am STABILEN Seed-pfad, der auch der React-Key ist
  // → kein Remount). Titel/teilen/promote/Dedup nutzen den aktuell gezeigten Pfad.
  const [liveLocs, setLiveLocs] = useState<Record<string, string>>({});
  const livePfad = (i: number) => liveLocs[pane.sekundaer[i]] ?? pane.sekundaer[i];
  const liveSek = pane.sekundaer.map((s) => liveLocs[s] ?? s);
  const titelVon = (pfad: string) => {
    const stand = erlassVonPfad(pfad, manifeste)?.stand ?? null;
    const m = stand && /^(\d{4})-(\d{2})-(\d{2})/.exec(stand);
    return { label: verlaufLabel(pfad, manifeste), stand: m ? `${m[3]}.${m[2]}.${m[1]}` : stand };
  };

  // Dedup gegen ALLE offenen Panes (Primär-URL inkl., Sekundäre live) — kein Doppel.
  const istOffen = (pfad: string) => {
    const n = tabSchluessel(pfad);
    return tabSchluessel(pathname + search) === n || liveSek.some((x) => tabSchluessel(x) === n);
  };
  // B-2: «daneben öffnen» nur ab lg + Kapazität; kein Doppel.
  const paneSteuerung = {
    oeffneDaneben: (pfad: string) => { if (!istOffen(pfad)) pane.oeffneDaneben(pfad); },
    kannOeffnen: istLg && pane.sekundaer.length < MAX_SEKUNDAER,
    istOffen,
  };
  // Fokus nach dem Schliessen eines Panes zurück in den Hauptinhalt (A11y).
  const schliesseUndFokus = (i: number) => {
    pane.schliesse(i);
    requestAnimationFrame(() => document.getElementById('inhalt')?.focus());
  };
  // Sekundär → Hauptfenster: dieses Pane wird die URL, das alte Hauptfenster rutscht an seinen Platz.
  const zumHauptfenster = (i: number) => {
    const altPrimaer = pathname + search + (typeof window !== 'undefined' ? window.location.hash : '');
    const ziel = livePfad(i);
    pane.ersetze(i, altPrimaer);
    navigate(ziel);
  };
  // Hauptfenster ✕: erstes Sekundär (live) zum Hauptfenster befördern (sonst zur Startseite).
  const schliesseHaupt = () => {
    if (pane.sekundaer.length > 0) { const z = livePfad(0); pane.schliesse(0); navigate(z); }
    else navigate('/');
  };
  // Drag-Drop-Umsortierung der SEKUNDÄREN Panes (Index im sekundaer-Array).
  const gezogen = useRef<number | null>(null);
  const [ueber, setUeber] = useState<number | null>(null);
  const dndSpalte = (i: number) => ({
    onDragOver: (e: DragEvent) => { if (gezogen.current != null && gezogen.current !== i) { e.preventDefault(); if (ueber !== i) setUeber(i); } },
    onDrop: (e: DragEvent) => { e.preventDefault(); const von = gezogen.current; if (von != null && von !== i) pane.verschiebe(von, i); gezogen.current = null; setUeber(null); },
    ueber: ueber === i,
  });
  const dndGriff = (i: number) => ({
    onDragStart: (e: DragEvent) => { gezogen.current = i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); },
    onDragEnd: () => { gezogen.current = null; setUeber(null); },
  });

  // Schublade bei Routenwechsel schliessen — Render-Phasen-Abgleich statt Effect
  // (React-Muster «adjusting state when props change»).
  const [letzterPfad, setLetzterPfad] = useState(pathname);
  if (pathname !== letzterPfad) { setLetzterPfad(pathname); if (schubladeOffen) setSchubladeOffen(false); }

  // Fokus-Falle + Escape + Fokus-Rückgabe an den ☰-Auslöser über den geteilten
  // Dialog-Hook (§5: dieselbe Fokusverwaltung wie alle Overlays). Der Container
  // trägt role="dialog"/aria-modal + tabIndex={-1}; so wird aria-modal auch für
  // die Tastatur eingelöst (Tab bleibt in der Schublade, WCAG 2.4.3), und beim
  // Schliessen kehrt der Fokus auf den ☰-Knopf zurück statt an <body>.
  useDialogFokus(schubladeOffen, schubladeRef, () => setSchubladeOffen(false));

  return (
    <div className="min-h-screen bg-paper">
      {/* Skip-Link (WCAG 2.4.1): erstes fokussierbares Element, springt in den Inhalt. */}
      <a href="#inhalt"
        className="lc-btn lc-btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50">
        Zum Inhalt springen
      </a>

      <div className="lg:flex">
        {/* Persistente Desktop-Seitenleiste: sticky, eigene Scrollachse, Breite
            per Ziehgriff verstellbar, per Topbar-Schalter einklappbar. */}
        {!seitenleiste.eingeklappt && (
          <>
            <aside
              className="hidden lg:flex lg:flex-col shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-line"
              style={{ width: seitenleiste.breite, background: 'color-mix(in srgb, var(--paper-sunken) 35%, var(--paper))' }}
            >
              <Sidebar />
            </aside>
            <ZiehGriff breite={seitenleiste.breite} setBreite={seitenleiste.setBreite} />
          </>
        )}

        {/* Rechte Spalte: Top-Streifen + Inhalt + Footer. Im Multipane-Modus
            höhenbegrenzt (h-screen), damit die Panes je eigen scrollen. */}
        <div className={`flex-1 min-w-0 flex flex-col ${multipane ? 'h-dvh' : 'min-h-screen'}`}>
          {/* PaneSteuerung umfasst AUCH die Topbar — der Reiter-Tracker dort bietet
              «⧉ nebeneinander öffnen» an (usePaneSteuerung). */}
          <PaneSteuerungProvider value={paneSteuerung}>
          <Topbar
            onMenu={() => setSchubladeOffen(true)}
            seitenleisteEingeklappt={seitenleiste.eingeklappt}
            onSeitenleisteUmschalten={seitenleiste.umschalten}
            inhaltBreit={inhaltsbreite.breit}
            onInhaltsbreiteSetzen={inhaltsbreite.setBreite}
            zeigeInhaltsbreite={!multipane}
          />

          {/* Persistenter Hinweis bei Nicht-DE-Locale: Inhalte fallen auf Deutsch zurück. */}
          {locale !== 'de' && (
            <div className="bg-warn-bg border-b border-warn-500">
              <div className={`${multipane ? 'max-w-none' : inhaltsbreiteKlasse} mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2`}>
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

          {/* STABILE Element-Kette um {children} in 1-Pane UND Multipane → kein
              Remount des Primär-Inhalts beim Öffnen/Schliessen des ersten/letzten
              Panes (sonst Scroll-/State-Verlust, Bugcheck). In 1-Pane ist der
              Wrapper `contents` (layoutneutral) + PaneProvider DOM-neutral →
              Default byte-gleich (Fensterscroll, kein container-type, kein overflow). */}
            <div className={multipane ? 'flex-1 flex min-h-0 max-lg:overflow-x-auto max-lg:snap-x max-lg:snap-mandatory' : 'contents'}>
              {/* Primäres Pane — gleiche Element-Kette zu {children} in beiden Modi
                  (Wrapper = `contents` im 1-Pane), nur Klassen/Provider wechseln →
                  kein Remount. PaneKopf + Overlay sind multipane-only GESCHWISTER
                  (nicht Vorfahren von {children}). */}
              <div className={multipane ? 'flex flex-col flex-1 min-w-0 max-lg:flex-none max-lg:w-full max-lg:snap-start' : 'contents'}>
                {multipane && (
                  <PaneKopf {...titelVon(pathname)} rolle="primaer" onSchliessen={schliesseHaupt} />
                )}
                <div className={multipane ? 'relative flex-1 min-h-0' : 'contents'}>
                  <PaneProvider value={multipane ? { imPane: true, rolle: 'primaer', wurzel: primaerWurzel, overlayWurzel: primaerOverlay } : KEIN_PANE}>
                    <main ref={primaerWurzel} id="inhalt" tabIndex={-1} aria-label="Hauptinhalt"
                      data-pane={multipane ? 'primaer' : undefined}
                      className={multipane
                        ? '@container/pane absolute inset-0 overflow-y-auto overscroll-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-600 focus-visible:-outline-offset-2'
                        : 'flex-1 w-full focus:outline-none'}>
                      <div className={multipane
                        ? 'mx-auto w-full max-w-content px-5 sm:px-6 py-6'
                        : `${inhaltsbreiteKlasse} mx-auto px-5 sm:px-6 py-8 sm:py-12`}>{children}</div>
                    </main>
                  </PaneProvider>
                  {multipane && <div ref={primaerOverlay} className="pointer-events-none absolute inset-0 overflow-hidden" />}
                </div>
              </div>
              {/* Sekundäre Panes (<Routes location> + eigener Navigator + PaneKopf). */}
              {multipane && pane.sekundaer.map((pfad, i) => (
                <SekundaerPane key={pfad} pfad={pfad} {...titelVon(livePfad(i))}
                  onNavigiert={(p) => setLiveLocs((m) => (m[pfad] === p ? m : { ...m, [pfad]: p }))}
                  onSchliessen={() => schliesseUndFokus(i)}
                  onHauptfenster={() => zumHauptfenster(i)}
                  onTeilen={() => navigator.clipboard?.writeText(layoutPermalink(liveSek))?.catch(() => {})}
                  onLinks={() => pane.verschiebe(i, i - 1)} onRechts={() => pane.verschiebe(i, i + 1)}
                  kannLinks={i > 0} kannRechts={i < pane.sekundaer.length - 1}
                  ziehbar={pane.sekundaer.length > 1} {...dndGriff(i)} {...dndSpalte(i)} />
              ))}
            </div>
          {!multipane && <Footer />}
          </PaneSteuerungProvider>
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
                <span aria-hidden className="text-base leading-none">✕</span>
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
