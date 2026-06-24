import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import { schliesseTab, leereTabs, ordneTabsUm } from '../../lib/tabs';
import { verlaufLabel, gesetzPfad, entscheidPfad, pfadTeil, type VerlaufManifeste } from '../../lib/verlaufLabel';

// ─── In-App-Reiter-Streifen (v1, Auftrag David) ─────────────────────────────
//
// Schmale Reiter-Leiste unter dem Top-Streifen: mehrere offene Engines/Gesetze/
// Vorlagen/Entscheide, Klick wechselt OHNE Browser-Tab. Reine Darstellung/
// Navigation (§3): die Reiter-Liste lebt in lib/tabs.ts (localStorage), die
// Labels löst der geteilte verlaufLabel-Resolver auf (§5, kein zweites Register).
//
// GOLDEN/PRERENDER-SCHUTZ: bei SSR (kein window) ODER weniger als 2 Reitern
// rendert der Streifen NICHTS — der prerenderte HTML bleibt byte-gleich, die
// 0/1-Reiter-Optik ist identisch zu vorher (kein Layout-Shift). Reiter v1 ist
// navigationsbasiert: persistiert wird die Reiter-LISTE, nicht der flüchtige
// Formular-State einer Seite (key={pathname}-Remount; bewusste Grenze).
export function TabStreifen() {
  const tabs = useTabs();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  // #12: Drag-and-Drop-Sortierung. gezogen = Pfad des gezogenen Reiters (Ref →
  // kein Re-Render beim Ziehen); ueberTeil = Drop-Ziel für die visuelle Markierung.
  const gezogen = useRef<string | null>(null);
  const [ueberTeil, setUeberTeil] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Eigene Höhe als CSS-Variable veröffentlichen, damit in-page-sticky-Leisten
  // (z.B. die Gesetz-Suchleiste) sich UNTER den Reiter-Streifen stapeln statt ihn
  // zu verdecken. 0px, wenn der Streifen nicht rendert (< 2 Reiter).
  useEffect(() => {
    const wurzel = document.documentElement;
    wurzel.style.setProperty('--tabstreifen-h', navRef.current ? `${navRef.current.offsetHeight}px` : '0px');
    return () => wurzel.style.setProperty('--tabstreifen-h', '0px');
  }, [tabs.length]);

  // Reader-Labels (Gesetz/Entscheid) aus den ohnehin lazy ladbaren Manifesten —
  // nur laden, wenn ein Reiter eine solche Route trägt (wie die Verlauf-Schiene).
  useEffect(() => {
    const brauchtG = tabs.some((t) => gesetzPfad(t.path));
    const brauchtE = tabs.some((t) => entscheidPfad(t.path));
    if (!brauchtG && !brauchtE) return;
    let lebt = true;
    (async () => {
      const [g, ent] = await Promise.all([
        brauchtG ? import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()) : Promise.resolve(null),
        brauchtE ? import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()) : Promise.resolve(null),
      ]);
      if (lebt) setManifeste({ gesetze: g, entscheide: ent });
    })();
    return () => { lebt = false; };
  }, [tabs]);

  // Guard: weniger als 2 Reiter → nichts rendern (Optik/golden/prerender
  // byte-gleich, kein Layout-Shift). Im Prerender (node, kein localStorage)
  // liefert ladeTabs() ohnehin [] → der Streifen bleibt dort immer unsichtbar.
  if (tabs.length < 2) return null;

  const schliessen = (path: string) => {
    const teil = pfadTeil(path);
    if (pfadTeil(pathname) === teil) {
      // Aktiven Reiter schliessen → auf den linken Nachbarn (sonst rechten, sonst Start).
      const idx = tabs.findIndex((t) => pfadTeil(t.path) === teil);
      const nachbar = tabs[idx - 1] ?? tabs[idx + 1];
      schliesseTab(path);
      navigate(nachbar ? nachbar.path : '/');
    } else {
      schliesseTab(path);
    }
  };

  // Bewusst KEINE role="tablist"/role="tab"-Semantik: der Streifen ist
  // Navigation (Klick navigiert Routen, kein In-Place-Panel-Wechsel) — ein
  // tablist verlangt zudem ausschliesslich tab-Kinder (a11y-Befund). Stattdessen
  // eine schlichte Liste mit aria-current="page" auf dem aktiven Reiter; der
  // «Alle schliessen»-Knopf steht NEBEN der Liste, nicht darin.
  return (
    <nav aria-label="Geöffnete Reiter" ref={navRef}
      className="sticky top-16 z-10 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 96%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="flex items-stretch gap-2 px-2 sm:px-4 py-1.5">
        <ul className="flex items-stretch gap-1 overflow-x-auto min-w-0 lc-scroll-x" style={{ scrollSnapType: 'x proximity' }}>
          {tabs.map((t) => {
            const aktiv = pfadTeil(pathname) === pfadTeil(t.path);
            const teil = pfadTeil(t.path);
            return (
              <li key={t.path} className="shrink-0" style={{ scrollSnapAlign: 'start' }}
                onDragOver={(e) => { e.preventDefault(); if (gezogen.current) setUeberTeil(teil); }}
                onDragLeave={() => setUeberTeil((u) => (u === teil ? null : u))}
                onDrop={(e) => {
                  e.preventDefault();
                  const von = gezogen.current;
                  gezogen.current = null;
                  setUeberTeil(null);
                  if (von) ordneTabsUm(von, t.path);
                }}>
                <span draggable
                  onDragStart={(e) => { gezogen.current = t.path; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.path); }}
                  onDragEnd={() => { gezogen.current = null; setUeberTeil(null); }}
                  className={`group/tab inline-flex items-center rounded-md border transition-colors cursor-grab active:cursor-grabbing ${
                  aktiv ? 'border-brass-400 bg-brass-100/50 text-brass-800' : 'border-line bg-surface text-ink-600 hover:text-ink-900 hover:border-brass-300'
                } ${ueberTeil === teil ? 'ring-2 ring-brass-400' : ''}`}>
                  <button type="button" aria-current={aktiv ? 'page' : undefined}
                    onClick={() => navigate(t.path)}
                    className="max-w-[10rem] sm:max-w-[14rem] truncate pl-3 pr-1.5 py-1.5 text-body-s font-medium">
                    {verlaufLabel(t.path, manifeste)}
                  </button>
                  <button type="button" onClick={() => schliessen(t.path)}
                    aria-label={`Reiter «${verlaufLabel(t.path, manifeste)}» schliessen`}
                    className="inline-flex items-center justify-center w-7 h-7 mr-0.5 rounded text-ink-500 hover:text-danger-700 transition-colors">
                    <span aria-hidden className="text-sm leading-none">✕</span>
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => { leereTabs(); navigate('/'); }}
          className="ml-auto shrink-0 self-center px-2.5 py-1.5 text-body-s text-ink-600 hover:text-brass-700 transition-colors whitespace-nowrap">
          Alle schliessen
        </button>
      </div>
    </nav>
  );
}
