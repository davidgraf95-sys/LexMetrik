import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { SprachUmschalter } from '../SprachUmschalter';

// Header (Iteration 6, Auftrag David 7.6.2026): DREI-ZONEN-Layout — Logo
// links, SUCHE in der Mitte (vorher im Katalog; David: «die suchfunktion in
// den header»), Aktionscluster rechts (Sprache · Methodik). «Über» bleibt
// im Footer (Entscheid 5.6.2026).
const NAV = [
  { to: '/methodik', label: 'Methodik', match: (p: string) => p === '/methodik' },
];

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

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 96%, transparent)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      {/* Utility-Bar (schlank): nur der Pflichthinweis rechts – der Claim
          steht genau einmal im Hero. Auf Mobile ausgeblendet. */}
      <div className="hidden sm:block border-b border-line" style={{ background: 'color-mix(in srgb, var(--paper-sunken) 55%, transparent)' }}>
        <div className="max-w-content mx-auto px-5 sm:px-6 h-7 flex items-center justify-end">
          {/* ink-600 statt ink-500: auf dem paper-sunken-Streifen mass axe
              4.44:1 (< 4.5 AA) für die 11-px-Zeile — axe-Befund 10.6.2026. */}
          <p className="lc-overline text-ink-600 truncate">Orientierung – keine Rechtsberatung</p>
        </div>
      </div>

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

        <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sprache (en/fr/it «in Bearbeitung», DE-Fallback) */}
          <SprachUmschalter />
          {NAV.map((n) => {
            const aktiv = n.match(pathname);
            return (
              <Link key={n.to} to={n.to}
                className={`relative px-2.5 sm:px-3 py-2 text-body-s font-medium no-underline transition-colors ${
                  aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
                }`}>
                {n.label}
                {/* Aktives Item: Messing-Balken als Unterstrich (Designsystem §5) */}
                {aktiv && <span className="scale-rule scale-rule-sm absolute left-2 right-2 -bottom-0.5" aria-hidden />}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
