import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import { schliesseTab, leereTabs, tabSchluessel, type TabEintrag } from '../../lib/tabs';
import { type VerlaufManifeste } from '../../lib/verlaufLabel';
import { reiterKategorie, herkunftVon, KAT_ORDER, HERKUNFT_ORDER } from '../../lib/tabGruppen';
import { TabPanel } from './TabPanel';
import { useDialogFokus } from './useDialogFokus';
import { usePaneSteuerung } from './usePaneLayout';

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
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  const [panelOffen, setPanelOffen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Flyout-Position: viewport-fixiert, aber AM TRIGGER verankert (nicht in der
  // Viewport-Ecke). Früher `fixed top-16 right-2` → das Panel klappte am rechten
  // Bildschirmrand auf, egal wo der ☰-Trigger stand (David 28.6.: «erscheint am
  // anderen Ende des Bildschirms»). Jetzt rechtsbündig unter den Trigger geklemmt
  // (8px Rand) — gleiches Muster wie FnRef.positioniere (ArtikelBody).
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const positioniere = () => {
    const t = triggerRef.current;
    if (t == null || typeof window === 'undefined') return;
    const r = t.getBoundingClientRect();
    const breite = Math.min(320, window.innerWidth - 16); // w-[20rem] bzw. max-w-[calc(100vw-1rem)]
    const left = Math.max(8, Math.min(r.right - breite, window.innerWidth - breite - 8));
    setPos({ top: r.bottom + 4, left });
  };

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

  // Klick ausserhalb schliesst das Flyout. «Innen» = Trigger ODER das portalierte
  // Panel (beide Refs prüfen, da das Panel an <body> hängt und nicht im DOM-
  // Teilbaum des Triggers liegt). Escape, Fokus-Verlagerung INS Panel, Fokus-Falle
  // und Fokus-Rückgabe übernimmt useDialogFokus (unten) — hier nur Outside-Klick.
  useEffect(() => {
    if (!panelOffen) return;
    const zu = (e: MouseEvent) => {
      const ziel = e.target as Node;
      if (triggerRef.current?.contains(ziel) || panelRef.current?.contains(ziel)) return;
      setPanelOffen(false);
    };
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [panelOffen]);

  // Position am Trigger nachführen, solange das Flyout offen ist (Scroll/Resize).
  useEffect(() => {
    if (!panelOffen) return;
    const neu = () => positioniere();
    window.addEventListener('scroll', neu, true);
    window.addEventListener('resize', neu);
    return () => {
      window.removeEventListener('scroll', neu, true);
      window.removeEventListener('resize', neu);
    };
  }, [panelOffen]);

  // Dialog-Fokusverwaltung (role="dialog"): Fokus beim Öffnen INS portalierte
  // Panel setzen, Tab darin halten und beim Schliessen an den ☰-Trigger zurück-
  // geben — das als Dialog angekündigte Overlay wird so auch tastatur-/SR-tauglich.
  useDialogFokus(panelOffen, panelRef, () => setPanelOffen(false));

  // Identität inkl. Instanz-Diskriminator (?r): dasselbe Gesetz kann mehrfach
  // offen sein, der aktive Reiter ist genau die passende Instanz.
  const aktivSchluessel = tabSchluessel(pathname + search);

  // Visuelle Reihenfolge der Reiter — exakt wie das TabPanel rendert: nach
  // KAT_ORDER, innerhalb «gesetze» nach HERKUNFT_ORDER, Reiter ohne auflösbare
  // Herkunft (Manifest noch nicht geladen) ans Ende. Grundlage für den Nachbarn
  // beim Schliessen des AKTIVEN Reiters: der sichtbar benachbarte Reiter, NICHT
  // der rohe tabs-Array-(Speicher-)Nachbar.
  const visuelleReihenfolge = (): TabEintrag[] => {
    const out: TabEintrag[] = [];
    for (const kat of KAT_ORDER) {
      const inKat = tabs.filter((t) => reiterKategorie(t.path) === kat);
      if (kat === 'gesetze') {
        for (const h of HERKUNFT_ORDER) out.push(...inKat.filter((t) => herkunftVon(t.path, manifeste) === h));
        out.push(...inKat.filter((t) => herkunftVon(t.path, manifeste) === null));
      } else {
        out.push(...inKat);
      }
    }
    return out;
  };

  const schliessen = (path: string) => {
    const teil = tabSchluessel(path);
    if (aktivSchluessel === teil) {
      // Aktiven Reiter schliessen → auf den VISUELL benachbarten Reiter (gruppierte
      // Panel-Reihenfolge), sonst Start. NICHT der rohe tabs-Array-Nachbar.
      const ordnung = visuelleReihenfolge();
      const idx = ordnung.findIndex((t) => tabSchluessel(t.path) === teil);
      const nachbar = ordnung[idx - 1] ?? ordnung[idx + 1];
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
        onClick={() => { if (!panelOffen) positioniere(); setPanelOffen((v) => !v); }}
      >
        <span aria-hidden className="text-base leading-none">☰</span>
        <span className="num text-micro text-ink-500">{tabs.length}</span>
      </button>

      {panelOffen && pos && createPortal(
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Alle geöffneten Reiter"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-40 w-[20rem] max-w-[calc(100vw-1rem)] rounded-lg border border-line bg-paper-raised shadow-lg p-2 max-h-[70vh] overflow-y-auto focus:outline-none"
        >
          <TabPanel
            tabs={tabs}
            manifeste={manifeste}
            aktivSchluessel={aktivSchluessel}
            onNavigate={(p) => { navigate(p); setPanelOffen(false); }}
            onSchliessen={schliessen}
            onDaneben={kannOeffnen ? (p) => { oeffneDaneben(p); setPanelOffen(false); } : undefined}
            paneOffen={istOffen}
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
