import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { SprachUmschalter } from '../SprachUmschalter';
import { OBERKATEGORIEN } from '../../lib/oberkategorien';

// Persistente Navigation (Redesign E3): die vier Oberkategorien sind von JEDER
// Seite erreichbar — nicht mehr nur als Deckblatt-Kacheln auf «/». Jede führt
// auf den teilbaren Zustand «/?kategorie=<id>» (Katalog-SSoT, §5). Dazu die
// zwei Vertrauensseiten Methodik & Über.
const KATEGORIE_NAV = OBERKATEGORIEN.map((k) => ({ id: k.id, to: `/?kategorie=${k.id}`, label: k.titel }));
const SEKUNDAER_NAV = [
  { to: '/gesetze', label: 'Gesetze' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/ueber', label: 'Über' },
];

// Header (Iteration 6, Auftrag David 7.6.2026 · Redesign E3 14.6.2026):
// DREI-ZONEN-Hauptzeile — Logo links, SUCHE in der Mitte, Aktionscluster rechts
// (Sprache · Mobile-Menü). NEU: darunter eine ruhige, persistente Kategorie-
// Navigation (Desktop) bzw. ein Off-Canvas-Menü (Mobile), damit die vier
// Oberkategorien + Methodik/Über von überall erreichbar sind.

// Katalog-Suche im Header: Auf der Hauptseite ist die URL führend (?q=,
// teil-/lesezeichenfähig, Zurück-Taste; replace statt push — Tippen füllt
// keine History) und filtert das Register live. Auf allen anderen Seiten
// sammelt das Feld lokal und Enter führt zur Trefferliste auf «/».
// «/» fokussiert das Feld (Etappe 1.4 — Verhalten unverändert, neuer Ort).
function HeaderSuche() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const aufKatalog = pathname === '/';
  const q = aufKatalog ? (searchParams.get('q') ?? '') : '';
  const [wert, setWert] = useState(q);
  // URL führt: ändert sich ?q= (Zurück-Taste, Permalink, Zurücksetzen im
  // Register), folgt das Feld — als Render-Phase-Abgleich statt Effect
  // (React-Muster «adjusting state when props change», Lint-Befund).
  const [letztesQ, setLetztesQ] = useState(q);
  if (q !== letztesQ) { setLetztesQ(q); setWert(q); }

  const feld = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      if (feld.current) { e.preventDefault(); feld.current.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const setze = (v: string) => {
    setWert(v);
    if (!aufKatalog) return;
    const p = new URLSearchParams(searchParams);
    if (v) p.set('q', v); else p.delete('q');
    setSearchParams(p, { replace: true });
  };
  const abschicken = () => {
    const s = wert.trim();
    if (!aufKatalog && s) navigate(`/?q=${encodeURIComponent(s)}`);
  };

  return (
    <input
      ref={feld}
      type="search"
      value={wert}
      onChange={(e) => setze(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') abschicken(); }}
      placeholder="Suchen …  ( / )"
      className="lc-input h-9 py-0 text-body-s w-full"
      aria-label="Katalog durchsuchen"
      aria-keyshortcuts="/"
    />
  );
}

// Ein Navigationspunkt mit Messing-Unterstrich im aktiven Zustand (Designsystem §5).
function NavPunkt({ to, label, aktiv, onClick }: { to: string; label: string; aktiv: boolean; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} aria-current={aktiv ? 'page' : undefined}
      className={`relative px-3 py-2 text-body-s font-medium no-underline transition-colors ${
        aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
      }`}>
      {label}
      {aktiv && <span className="scale-rule scale-rule-sm absolute left-3 right-3 -bottom-px" aria-hidden />}
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const offeneKat = pathname === '/' ? params.get('kategorie') : null;
  const [menuOffen, setMenuOffen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menü bei Routenwechsel schliessen — als Render-Phasen-Abgleich statt Effect
  // (React-Muster «adjusting state when props change», wie in HeaderSuche).
  const [letzterPfad, setLetzterPfad] = useState(pathname);
  if (pathname !== letzterPfad) { setLetzterPfad(pathname); if (menuOffen) setMenuOffen(false); }

  // Escape schliesst; Fokus beim Öffnen in den Dialog (SSR-sicher: nur in Effekt/Handler).
  useEffect(() => {
    if (!menuOffen) return;
    menuRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOffen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOffen]);

  return (
    <header className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 96%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      {/* Hauptzeile: Logo links · Suche Mitte · Aktionscluster rechts */}
      <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        <Link to="/" className="inline-flex items-center gap-2 no-underline shrink-0" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          {/* Wortmarke nur ab sm — auf 390px trägt die Suche die Mitte. */}
          <LexMetrikWortmarke className="hidden sm:block text-[1.35rem]" />
        </Link>

        <div className="flex-1 min-w-0 max-w-xl">
          <HeaderSuche />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sprache (en/fr/it «in Bearbeitung», DE-Fallback) */}
          <SprachUmschalter />
          {/* Mobile-Menü-Schalter — auf Desktop trägt die Navigationsleiste unten */}
          <button type="button" className="lc-btn lc-btn-ghost lc-btn-sm sm:hidden" aria-label="Menü öffnen"
            aria-expanded={menuOffen} aria-controls="haupt-menue" onClick={() => setMenuOffen((o) => !o)}>
            <span aria-hidden className="text-[1.1rem] leading-none">☰</span>
          </button>
        </div>
      </div>

      {/* Persistente Kategorie-Navigation (Desktop) — ersetzt die frühere
          redundante Disclaimer-Utility-Bar; der Pflichthinweis steht im Footer. */}
      <nav aria-label="Hauptbereiche" className="hidden sm:block border-t border-line"
        style={{ background: 'color-mix(in srgb, var(--paper-sunken) 45%, transparent)' }}>
        <div className="max-w-content mx-auto px-5 sm:px-6 h-11 flex items-center gap-0.5">
          {KATEGORIE_NAV.map((n) => (
            <NavPunkt key={n.id} to={n.to} label={n.label} aktiv={offeneKat === n.id} />
          ))}
          <span className="flex-1" aria-hidden />
          {SEKUNDAER_NAV.map((n) => (
            <NavPunkt key={n.to} to={n.to} label={n.label} aktiv={pathname === n.to} />
          ))}
        </div>
      </nav>

      {/* Mobile: Off-Canvas-Menü — per Portal an <body>, weil der
          backdrop-filter des Headers sonst einen Containing-Block für
          position:fixed bildet und das Panel auf Header-Höhe zusammenstaucht.
          SSR-sicher: menuOffen ist beim ersten Render immer false. */}
      {menuOffen && createPortal(
        <div className="sm:hidden">
          <div className="fixed inset-0 z-30 bg-ink-900/30" onClick={() => setMenuOffen(false)} aria-hidden />
          <div id="haupt-menue" ref={menuRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Navigation"
            className="fixed top-0 right-0 z-40 h-full w-4/5 max-w-xs bg-paper-raised border-l border-line shadow-lg p-5 flex flex-col gap-0.5 focus:outline-none overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="lc-overline">Navigation</span>
              <button type="button" className="lc-btn lc-btn-ghost lc-btn-sm" aria-label="Menü schliessen" onClick={() => setMenuOffen(false)}>
                <span aria-hidden className="text-[1.05rem] leading-none">✕</span>
              </button>
            </div>
            {KATEGORIE_NAV.map((n) => (
              <Link key={n.id} to={n.to} onClick={() => setMenuOffen(false)} aria-current={offeneKat === n.id ? 'page' : undefined}
                className={`px-2 py-3 rounded-md text-body-l font-medium no-underline ${offeneKat === n.id ? 'text-ink-900 bg-brass-100/50' : 'text-ink-700 hover:bg-brass-100/40'}`}>
                {n.label}
              </Link>
            ))}
            <span className="h-px bg-line my-2" aria-hidden />
            {[...SEKUNDAER_NAV, { to: '/kontakt', label: 'Kontakt' }].map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMenuOffen(false)} aria-current={pathname === n.to ? 'page' : undefined}
                className={`px-2 py-3 rounded-md text-body-s font-medium no-underline ${pathname === n.to ? 'text-ink-900' : 'text-ink-600 hover:bg-brass-100/40'}`}>
                {n.label}
              </Link>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}
