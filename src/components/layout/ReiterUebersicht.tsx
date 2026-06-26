import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import { schliesseTab, leereTabs, tabSchluessel } from '../../lib/tabs';
import { type VerlaufManifeste } from '../../lib/verlaufLabel';
import { reiterKategorie } from '../../lib/tabGruppen';
import { TabPanel } from './TabPanel';

// ─── «Alle Reiter»-Übersicht in der Topbar (Auftrag David 26.6.2026) ────────
//
// Kapselt Trigger-Knopf + Flyout für ALLE offenen Reiter. Löst den früheren
// horizontalen TabStreifen ab: der State (offene Reiter, lazy geladene
// Reader-Manifeste, aktiver Reiter, Schliessen inkl. Nachbar-Navigation) wandert
// 1:1 hierher; die vertikale, nach Rubrik gruppierte Liste rendert weiterhin
// <TabPanel>. Reine Darstellung/Navigation (§3): die Reiter-Liste lebt in
// lib/tabs.ts (localStorage), die Gruppierung in lib/tabGruppen.ts (SSoT §5).
//
// CLIENT-ONLY: das Flyout hängt per createPortal an <body> und ist beim ersten
// Render zu (panelOffen=false) → im SSR/Prerender erscheint höchstens der
// Trigger-Knopf, kein Dialog (golden/prerender unverändert).

export function ReiterUebersicht() {
  const tabs = useTabs();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  const [panelOffen, setPanelOffen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reader-Labels (Gesetz/Entscheid) aus den ohnehin lazy ladbaren Manifesten —
  // nur laden, wenn ein Reiter eine solche Route trägt.
  useEffect(() => {
    const brauchtG = tabs.some((t) => reiterKategorie(t.path) === 'gesetze');
    const brauchtE = tabs.some((t) => reiterKategorie(t.path) === 'rechtsprechung');
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

  // Klick ausserhalb / ESC schliesst das Flyout. «Innen» = Trigger ODER das
  // portalierte Panel (beide Refs prüfen, da das Panel an <body> hängt und nicht
  // im DOM-Teilbaum des Triggers liegt).
  useEffect(() => {
    if (!panelOffen) return;
    const zu = (e: MouseEvent) => {
      const ziel = e.target as Node;
      if (triggerRef.current?.contains(ziel) || panelRef.current?.contains(ziel)) return;
      setPanelOffen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOffen(false); };
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', zu); document.removeEventListener('keydown', esc); };
  }, [panelOffen]);

  // Identität inkl. Instanz-Diskriminator (?r): dasselbe Gesetz kann mehrfach
  // offen sein, der aktive Reiter ist genau die passende Instanz.
  const aktivSchluessel = tabSchluessel(pathname + search);

  const schliessen = (path: string) => {
    const teil = tabSchluessel(path);
    if (aktivSchluessel === teil) {
      // Aktiven Reiter schliessen → auf den linken Nachbarn (sonst rechten, sonst Start).
      const idx = tabs.findIndex((t) => tabSchluessel(t.path) === teil);
      const nachbar = tabs[idx - 1] ?? tabs[idx + 1];
      schliesseTab(path);
      navigate(nachbar ? nachbar.path : '/');
    } else {
      schliesseTab(path);
    }
  };

  // Kein offener Reiter → Trigger ausblenden (nichts zu zeigen).
  if (tabs.length < 1) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="lc-btn lc-btn-ghost lc-btn-sm shrink-0"
        aria-haspopup="dialog"
        aria-expanded={panelOffen}
        aria-label="Alle geöffneten Reiter"
        onClick={() => setPanelOffen((v) => !v)}
      >
        <span aria-hidden className="text-base leading-none">☰</span>
        <span className="num text-micro text-ink-500">{tabs.length}</span>
      </button>

      {panelOffen && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Alle geöffneten Reiter"
          className="fixed top-16 right-2 sm:right-4 z-40 mt-1 w-[20rem] max-w-[calc(100vw-1rem)] rounded-lg border border-line bg-paper-raised shadow-lg p-2 max-h-[70vh] overflow-y-auto"
        >
          <TabPanel
            tabs={tabs}
            manifeste={manifeste}
            aktivSchluessel={aktivSchluessel}
            onNavigate={(p) => { navigate(p); setPanelOffen(false); }}
            onSchliessen={schliessen}
          />
          {tabs.length > 1 && (
            <div className="mt-1 border-t border-line pt-1">
              <button type="button"
                onClick={() => { leereTabs(); navigate('/'); setPanelOffen(false); }}
                className="w-full rounded px-2 py-1.5 text-left text-body-s text-ink-600 hover:bg-paper-sunken/60 hover:text-brass-700 transition-colors">
                Alle schliessen
              </button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
